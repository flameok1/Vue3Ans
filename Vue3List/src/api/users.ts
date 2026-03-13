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

  // 搜尋模式：只搜快取中未刪除的資料
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

  // 這頁需要的最後一筆有效資料的位置
  const neededValidCount = page * pageSize;

  // 補足快取：跳過 tombstone，直到累計有效筆數 >= neededValidCount
  let validCount = 0;
  let currentId = 1;

  while (validCount < neededValidCount && currentId <= TOTAL_ROWS) {
    ensureUserCached(currentId);
    if (!deletedIds.has(currentId)) {
      validCount++;
    }
    currentId++;
  }

  // 對快取中所有未刪除的資料排序
  const allValid = [...userCache.values()].filter((u) => !deletedIds.has(u.id));
  const sorted = sortUsers(allValid, sortField, sortOrder);

  // 切出這頁的資料
  const start = (page - 1) * pageSize;
  const data = sorted.slice(start, start + pageSize);

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