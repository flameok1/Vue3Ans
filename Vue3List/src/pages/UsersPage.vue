<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useUsers } from '../composables/useUsers';
import type { User } from '../types/user';
import SearchBar from '../components/SearchBar.vue';
import Pagination from '../components/Pagination.vue';
import UserTable from '../components/UserTable.vue';
import UserCard from '../components/UserCard.vue';
import UserModal from '../components/UserModal.vue';

const {
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
  setPage,
  setSort,
  setSearchImmediate,
  setSearchDebounced,
  addUser,
  editUser,
  removeUser,
} = useUsers({ initialPageSize: 500, searchDebounceMs: 300 });

const showModal = ref(false);
const editingUser = ref<User | null>(null);
const deletingUser = ref<User | null>(null);
const deleting = ref(false);

const hasData = computed(() => (users.value ?? []).length > 0);

function handleAddClick() {
  editingUser.value = null;
  showModal.value = true;
}

function handleEdit(user: User) {
  editingUser.value = user;
  showModal.value = true;
}

async function handleModalSubmit(payload: Omit<User, 'id'>, id?: number) {
  try {
    if (id != null) {
      await editUser(id, payload);
    } else {
      await addUser(payload);
    }
    showModal.value = false;
  } catch {
    // error state 已由 composable 處理
  }
}

function confirmDelete(user: User) {
  deletingUser.value = user;
}

async function performDelete() {
  if (!deletingUser.value) return;
  deleting.value = true;
  try {
    await removeUser(deletingUser.value.id);
    deletingUser.value = null;
  } catch {
    // error state 已由 composable 處理
  } finally {
    deleting.value = false;
  }
}

watch(
  () => search.value,
  (val) => {
    // 確保外層 SearchBar 雙向綁定維持同步
  },
);
</script>

<template>
  <div class="users-page">
    <div class="users-page-inner">
      <header class="users-page-header">
        <div>
          <h1 class="users-page-title">使用者管理</h1>
          <p class="users-page-subtitle">
            管理 1,000 萬筆以上的大型使用者資料，支援伺服端分頁、排序與搜尋。
          </p>
        </div>
        <button type="button" class="btn btn-primary btn-add-desktop" @click="handleAddClick">
          <span>＋</span>
          <span>新增使用者</span>
        </button>
      </header>

      <section
        class="users-page-filters"
      >
        <div class="users-page-search">
          <SearchBar
            :model-value="search"
            :debounce="true"
            @input-immediate="setSearchDebounced"
          />
        </div>
        <div class="users-page-pageinfo">
          <div class="users-page-pageinfo-text">
            當前每頁載入
            <span class="users-page-pageinfo-highlight">{{ pageSize }}</span>
            筆資料（伺服端分頁）
          </div>
        </div>
      </section>

      <main>
        <div v-if="loading" class="users-page-loading">
          <div class="loading-title-skeleton" />
          <div class="loading-table-skeleton">
            <div v-for="i in 6" :key="i" class="loading-row">
              <div class="loading-cell" />
              <div class="loading-cell" />
              <div class="loading-cell" />
              <div class="loading-cell small" />
              <div class="loading-cell" />
            </div>
          </div>
        </div>

        <div v-else>
          <div v-if="error" class="error-alert">
            請求失敗：{{ error }}
          </div>

          <template v-if="hasData">
            <UserTable
              :users="users"
              :sort-field="sortField || ''"
              :sort-order="sortOrder || ''"
              @sort="setSort"
              @edit="handleEdit"
              @delete="confirmDelete"
            />

            <UserCard
              :users="users"
              @edit="handleEdit"
              @delete="confirmDelete"
            />

            <div class="users-page-pagination">
              <Pagination
                :page="page"
                :page-size="pageSize"
                :total="total"
                :total-pages="totalPages"
                @change="setPage"
              />
            </div>
          </template>

          <div
            v-else
            class="empty-state"
          >
            <div class="empty-state-icon">📭</div>
            <h2 class="empty-state-title">目前沒有資料</h2>
            <p class="empty-state-text">
              試著調整搜尋條件，或點擊「新增使用者」建立第一筆資料。
            </p>
            <button
              type="button"
              class="btn btn-primary"
              @click="handleAddClick"
            >
              新增使用者
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile floating add button -->
    <button type="button" class="fab-add-user" @click="handleAddClick">
      ＋
    </button>

    <UserModal
      v-model="showModal"
      :user="editingUser"
      @submit="handleModalSubmit"
    />

    <!-- Delete confirm -->
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="deletingUser"
          class="delete-overlay"
        >
          <div class="delete-dialog">
            <h2 class="delete-dialog-title">確認刪除</h2>
            <p class="delete-dialog-text">
              確定要刪除使用者
              <span class="delete-dialog-user">
                {{ deletingUser.username }}
              </span>
              嗎？此操作無法還原。
            </p>
            <div class="delete-dialog-actions">
              <button
                type="button"
                class="btn btn-secondary"
                :disabled="deleting"
                @click="deletingUser = null"
              >
                取消
              </button>
              <button
                type="button"
                class="btn btn-danger"
                :disabled="deleting"
                @click="performDelete"
              >
                {{ deleting ? '刪除中…' : '確定刪除' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.users-page {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.users-page-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px 16px;
  box-sizing: border-box;
}

.users-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.users-page-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.users-page-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.16);
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-danger {
  background-color: #dc2626;
  color: #ffffff;
}

.btn-danger:hover {
  background-color: #b91c1c;
}

.btn-add-desktop {
  display: none;
}

@media (min-width: 768px) {
  .btn-add-desktop {
    display: inline-flex;
  }
}

.users-page-filters {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5e7eb;
}

@media (min-width: 768px) {
  .users-page-filters {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.users-page-search {
  width: 100%;
}

@media (min-width: 768px) {
  .users-page-search {
    max-width: 420px;
  }
}

.users-page-pageinfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 768px) {
  .users-page-pageinfo {
    justify-content: flex-end;
  }
}

.users-page-pageinfo-text {
  font-size: 12px;
  color: #6b7280;
}

.users-page-pageinfo-highlight {
  font-weight: 600;
  color: #374151;
}

.users-page-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading-title-skeleton {
  width: 192px;
  height: 40px;
  border-radius: 8px;
  background-color: #e5e7eb;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-table-skeleton {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.loading-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.loading-cell {
  flex: 1 1 16%;
  height: 16px;
  border-radius: 4px;
  background-color: #e5e7eb;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-cell.small {
  flex-basis: 8%;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.error-alert {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background-color: #fef2f2;
  color: #b91c1c;
  font-size: 14px;
}

.users-page-pagination {
  margin-top: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
  border-radius: 16px;
  border: 1px dashed #d1d5db;
  background-color: #ffffff;
}

.empty-state-icon {
  margin-bottom: 8px;
  font-size: 32px;
}

.empty-state-title {
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.empty-state-text {
  margin-bottom: 16px;
  max-width: 320px;
  font-size: 13px;
  color: #6b7280;
}

.fab-add-user {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: none;
  background-color: #2563eb;
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 20px rgba(37, 99, 235, 0.45);
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.fab-add-user:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}

@media (min-width: 768px) {
  .fab-add-user {
    display: none;
  }
}

.delete-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.4);
  box-sizing: border-box;
}

.delete-dialog {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.4);
}

.delete-dialog-title {
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.delete-dialog-text {
  margin-bottom: 16px;
  font-size: 14px;
  color: #4b5563;
}

.delete-dialog-user {
  font-weight: 600;
  color: #111827;
}

.delete-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

