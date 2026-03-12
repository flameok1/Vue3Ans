import { ref, computed, watch } from 'vue';
import type { Ref } from 'vue';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/users';
import type { User, UserListResponse, UserQueryParams } from '../types/user';

interface UseUsersOptions {
  initialPageSize?: number;
  searchDebounceMs?: number;
}

export function useUsers(options: UseUsersOptions = {}) {
  const page = ref(1);
  const pageSize = ref(options.initialPageSize ?? 500);
  const search = ref('');
  const sortField = ref<UserQueryParams['sortField']>('');
  const sortOrder = ref<UserQueryParams['sortOrder']>('');

  const total = ref(0);
  const users: Ref<User[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let searchTimeout: number | null = null;
  const searchDebounceMs = options.searchDebounceMs ?? 300;

  const totalPages = computed(() =>
    total.value > 0 ? Math.ceil(total.value / pageSize.value) : 1,
  );

  const queryParams = computed<UserQueryParams>(() => ({
    page: page.value,
    pageSize: pageSize.value,
    search: search.value.trim() || '',
    sortField: sortField.value,
    sortOrder: sortOrder.value,
  }));

  async function loadUsers() {
    loading.value = true;
    error.value = null;
    try {
      const data: UserListResponse = await fetchUsers(queryParams.value);
      users.value = data.data;
      total.value = data.total;
    } catch (e: any) {
      error.value = e?.message ?? '載入使用者資料時發生錯誤';
    } finally {
      loading.value = false;
    }
  }

  function setPage(newPage: number) {
    if (newPage < 1 || newPage === page.value || newPage > totalPages.value) return;
    page.value = newPage;
  }

  function setSort(field: keyof User) {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? '' : 'asc';
    } else {
      sortField.value = field;
      sortOrder.value = 'asc';
    }
    page.value = 1;
  }

  function setSearchImmediate(value: string) {
    search.value = value;
    page.value = 1;
  }

  function setSearchDebounced(value: string) {
    if (searchTimeout !== null) {
      window.clearTimeout(searchTimeout);
    }
    searchTimeout = window.setTimeout(() => {
      setSearchImmediate(value);
    }, searchDebounceMs);
  }

  async function addUser(payload: Omit<User, 'id'>) {
    loading.value = true;
    error.value = null;
    try {
      await createUser(payload);
      await loadUsers();
    } catch (e: any) {
      error.value = e?.message ?? '新增使用者時發生錯誤';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function editUser(id: number, payload: Omit<User, 'id'>) {
    loading.value = true;
    error.value = null;
    try {
      await updateUser(id, payload);
      await loadUsers();
    } catch (e: any) {
      error.value = e?.message ?? '更新使用者時發生錯誤';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function removeUser(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (e: any) {
      error.value = e?.message ?? '刪除使用者時發生錯誤';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  watch(
    () => [queryParams.value.page, queryParams.value.pageSize, queryParams.value.search, queryParams.value.sortField, queryParams.value.sortOrder],
    () => {
      void loadUsers();
    },
    { immediate: true },
  );

  return {
    // state
    users,
    total,
    page,
    pageSize,
    totalPages,
    search,
    sortField,
    sortOrder,
    loading,
    error,
    // actions
    loadUsers,
    setPage,
    setSort,
    setSearchImmediate,
    setSearchDebounced,
    addUser,
    editUser,
    removeUser,
  };
}

