import type { User, UserListResponse, UserQueryParams } from '../types/user';

// 模擬總筆數（巨大資料量）
const TOTAL_ROWS = 10_000_000;

// 使用者自訂新增 / 編輯 / 刪除都存在這個記憶體陣列中
let customUsers: User[] = [];

function generateUser(index: number): User {
  return {
    id: index,
    username: `User_${index}`,
    position: ['Engineer', 'Manager', 'Designer'][index % 3] ?? 'Engineer',
    location: ['NY', 'Tokyo', 'Taipei'][index % 3] ?? 'NY',
    age: 20 + (index % 40),
    birthdate: '1990-01-01',
  };
}

function sortUsers(
  list: User[],
  sortField: UserQueryParams['sortField'],
  sortOrder: UserQueryParams['sortOrder'],
): User[] {
  if (!sortField || !sortOrder) return list;

  const sorted = [...list];
  sorted.sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];

    if (av === bv) return 0;

    // number / string 都簡單用 < > 比較即可
    const result = av < bv ? -1 : 1;
    return sortOrder === 'asc' ? result : -result;
  });

  return sorted;
}

// 模擬查詢 + 分頁 + 排序
export async function fetchUsers(params: UserQueryParams): Promise<UserListResponse> {
  const { page, pageSize, search, sortField, sortOrder } = params;

  // 模擬網路延遲
  await new Promise((r) => setTimeout(r, 300));

  // 有搜尋時，僅針對 customUsers 做搜尋（避免真的生成 1000 萬筆）
  if (search && search.trim()) {
    const keyword = search.toLowerCase();

    let filtered = customUsers.filter((u) => {
      return (
        u.username.toLowerCase().includes(keyword) ||
        u.position.toLowerCase().includes(keyword) ||
        u.location.toLowerCase().includes(keyword)
      );
    });

    filtered = sortUsers(filtered, sortField, sortOrder);

    return {
      total: filtered.length,
      page: 1,
      pageSize: filtered.length || pageSize,
      data: filtered,
    };
  }

  // 一般列表：從巨大資料集中取出指定頁面的資料，再加上 customUsers
  const start = (page - 1) * pageSize;
  const pageUsers: User[] = [];

  for (let i = 0; i < pageSize; i++) {
    const id = start + i + 1;
    if (id > TOTAL_ROWS) break;
    pageUsers.push(generateUser(id));
  }

  let combined = [...customUsers, ...pageUsers];
  combined = sortUsers(combined, sortField, sortOrder);

  const data = combined.slice(0, pageSize);

  return {
    total: TOTAL_ROWS + customUsers.length,
    page,
    pageSize,
    data,
  };
}

// 新增使用者（回傳含 id 的 User）
export async function createUser(payload: Omit<User, 'id'>): Promise<User> {
  const newUser: User = {
    id: Date.now(),
    ...payload,
  };

  customUsers.unshift(newUser);
  return newUser;
}

// 更新使用者（只會更新 customUsers 裡面的資料）
export async function updateUser(id: number, payload: Omit<User, 'id'>): Promise<User> {
  const index = customUsers.findIndex((u) => u.id === id);

  if (index === -1) {
    // 如果沒找到，就當作新增一筆（也可以選擇丟錯）
    const created: User = { id, ...payload };
    customUsers.unshift(created);
    return created;
  }

  const updated: User = { id, ...payload };
  customUsers[index] = updated;
  return updated;
}

// 刪除使用者（只刪 customUsers）
export async function deleteUser(id: number): Promise<void> {
  customUsers = customUsers.filter((u) => u.id !== id);
}

