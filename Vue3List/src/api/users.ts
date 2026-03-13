import type { User, UserListResponse, UserQueryParams } from '../types/user';

const TOTAL_ROWS = 10_000_000;

const userCache = new Map<number, User>();
const deletedIds = new Set<number>(); // tombstone
let customIdCounter = TOTAL_ROWS + 1;

function generateUser(index: number): User {
  return {
    id: index,
    username: `User_${index}`,
    position: (['Engineer', 'Manager', 'Designer'] as const)[index % 3] ?? 'Engineer',
    location: (['NY', 'Tokyo', 'Taipei'] as const)[index % 3] ?? 'NY',
    age: 20 + (index % 40),
    birthdate: '1990-01-01',
    order: 0,
  };
}

/** 確保指定 id 在快取中（且只建立一次） */
function ensureUserCached(id: number): void {
  if (id <= TOTAL_ROWS && !userCache.has(id)) {
    userCache.set(id, generateUser(id));
  }
}

function sortUsers(
  list: User[],
  sortField: UserQueryParams['sortField'],
  sortOrder: UserQueryParams['sortOrder'],
): User[] {
  if (!sortField || !sortOrder) return list;
  return [...list].sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    if (av === bv) return 0;
    return (av < bv ? -1 : 1) * (sortOrder === 'asc' ? 1 : -1);
  });
}

export async function fetchUsers(params: UserQueryParams): Promise<UserListResponse> {
  const { page, pageSize, search, sortField, sortOrder } = params;

  await new Promise((r) => setTimeout(r, 300));

  // 搜尋模式不處理 order
  if (search?.trim()) {
    const keyword = search.toLowerCase();
    const filtered = [...userCache.values()].filter(
      (u) =>
        !deletedIds.has(u.id) &&
        (u.username.toLowerCase().includes(keyword) ||
          u.position.toLowerCase().includes(keyword) ||
          u.location.toLowerCase().includes(keyword)),
    );
    const sorted = sortUsers(filtered, sortField, sortOrder);
    return {
      total: sorted.length,
      page: 1,
      pageSize: sorted.length || pageSize,
      data: sorted,
    };
  }

  // 取出所有有 order 的資料（order > 0），依 order 值排序
  const pinnedUsers = [...userCache.values()]
    .filter((u) => !deletedIds.has(u.id) && u.order > 0)
    .sort((a, b) => a.order - b.order);

  // pinnedUsers 佔用的 position（1-based），例如 order=1 佔第 1 個位置
  const pinnedPositions = new Set(pinnedUsers.map((u) => u.order));

  // 計算這頁需要幾筆「一般資料」（扣掉這頁內有 pinned 佔位的數量）
  const pageStart = (page - 1) * pageSize + 1; // 這頁第一個位置（1-based）
  const pageEnd = page * pageSize;              // 這頁最後一個位置（1-based）

  const pinnedInThisPage = pinnedUsers.filter(
    (u) => u.order >= pageStart && u.order <= pageEnd,
  ).length;

  const normalNeeded = pageSize - pinnedInThisPage;
  const normalSkip = (page - 1) * pageSize - 
    pinnedUsers.filter((u) => u.order < pageStart).length;

  // 補足快取
  const neededValidCount = normalSkip + normalNeeded;
  let validCount = 0;
  let currentId = 1;

  while (validCount < neededValidCount && currentId <= TOTAL_ROWS) {
    ensureUserCached(currentId);
    // pinned 的資料不算進一般資料的計數
    if (!deletedIds.has(currentId) && !(userCache.get(currentId)!.order > 0)) {
      validCount++;
    }
    currentId++;
  }

  // 對一般資料排序
  const normalUsers = [...userCache.values()].filter(
    (u) => !deletedIds.has(u.id) && !(u.order > 0),
  );
  const sortedNormal = sortUsers(normalUsers, sortField, sortOrder);
  const normalPage = sortedNormal.slice(normalSkip, normalSkip + normalNeeded);

  // 組合這頁資料：先建一個 pageSize 的陣列，pinned 插入指定位置，其餘填一般資料
  const result: (User | null)[] = new Array(pageSize).fill(null);

  // 把 pinned 放到對應的 slot
  for (const pinned of pinnedUsers) {
    let slot = pinned.order - pageStart;
    if (slot < 0 || slot >= pageSize) continue;

    // 如果 slot 已被佔用，往後找第一個空位
    while (slot < pageSize && result[slot] !== null) {
      slot++;
    }

    if (slot < pageSize) {
      result[slot] = pinned;
    }
  }

  // 空位填入一般資料
  let normalIdx = 0;
  for (let i = 0; i < pageSize; i++) {
    if (result[i] === null) {
      result[i] = normalPage[normalIdx++] ?? null;
    }
  }

  const data = result.filter((u): u is User => u !== null);

  const total = TOTAL_ROWS - deletedIds.size +
    [...userCache.keys()].filter((id) => id > TOTAL_ROWS && !deletedIds.has(id)).length;

  return { total, page, pageSize, data };
}


export async function createUser(payload: Omit<User, 'id'>): Promise<User> {
  const newUser: User = { id: customIdCounter++, ...payload };
  userCache.set(newUser.id, newUser);
  return newUser;
}

export async function updateUser(id: number, payload: Omit<User, 'id'>): Promise<User> {
  ensureUserCached(id);
  const updated: User = { id, ...payload };
  userCache.set(id, updated);
  return updated;
}

export async function deleteUser(id: number): Promise<void> {
  deletedIds.add(id); // tombstone，不從 userCache 移除
}