export interface User {
  id: number;
  username: string;
  position: string;
  location: string;
  age: number;
  birthdate: string;
}

export interface UserQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  sortField?: keyof User | '';
  sortOrder?: 'asc' | 'desc' | '';
}

export interface UserListResponse {
  total: number;
  page: number;
  pageSize: number;
  data: User[];
}

