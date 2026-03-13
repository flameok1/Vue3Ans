<script setup lang="ts">
import type { User } from '../types/user';

const props = defineProps<{
  users: User[];
  sortField: keyof User | '';
  sortOrder: 'asc' | 'desc' | '';
}>();

const emits = defineEmits<{
  (e: 'sort', field: keyof User): void;
  (e: 'edit', user: User): void;
  (e: 'delete', user: User): void;
}>();

const sortableHeaders: { key: keyof User; label: string }[] = [
  { key: 'username', label: '使用者名稱' },
  { key: 'position', label: '職位' },
  { key: 'location', label: '地點' },
  { key: 'age', label: '年齡' },
  { key: 'birthdate', label: '生日' },
];

function sortBy(key: keyof User) {
  emits('sort', key);
}

function sortIcon(key: keyof User) {
  if (props.sortField !== key || !props.sortOrder) return '⇅';
  return props.sortOrder === 'asc' ? '↑' : '↓';
}
</script>

<template>
  <div class="user-table-mobile-sort">
    <div class="user-table-mobile-sort-title">排序</div>
    <div class="user-table-mobile-sort-buttons">
      <button
        v-for="header in sortableHeaders"
        :key="header.key"
        type="button"
        class="user-table-mobile-sort-button"
        @click="sortBy(header.key)"
      >
        <span class="user-table-mobile-sort-label">{{ header.label }}</span>
        <span class="user-table-mobile-sort-icon">{{ sortIcon(header.key) }}</span>
      </button>
    </div>
  </div>

  <div class="user-table-wrapper">
    <table class="user-table">
      <thead class="user-table-head">
        <tr>
          <th
            v-for="header in sortableHeaders"
            :key="header.key"
            scope="col"
            class="user-table-header-cell"
          >
            <button
              type="button"
              class="user-table-sort-button"
              @click="sortBy(header.key)"
            >
              <span>{{ header.label }}</span>
              <span class="user-table-sort-icon">
                {{ sortIcon(header.key) }}
              </span>
            </button>
          </th>
          <th scope="col" class="user-table-header-cell">Order</th>
          <th
            scope="col"
            class="user-table-header-cell user-table-header-actions"
          >
            操作
          </th>
        </tr>
      </thead>
      <tbody class="user-table-body">
        <tr v-for="user in users" :key="user.id" class="user-table-row">
          <td class="user-table-cell strong">{{ user.username }}</td>
          <td class="user-table-cell">{{ user.position }}</td>
          <td class="user-table-cell">{{ user.location }}</td>
          <td class="user-table-cell">{{ user.age }}</td>
          <td class="user-table-cell">{{ user.birthdate }}</td>
          <td class="user-table-cell">{{ user.order }}</td>
          <td class="user-table-cell user-table-cell-actions">
            <div class="user-table-actions">
              <button
                type="button"
                class="btn-table"
                @click="$emit('edit', user)"
              >
                編輯
              </button>
              <button
                type="button"
                class="btn-table btn-table-danger"
                @click="$emit('delete', user)"
              >
                刪除
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.user-table-mobile-sort {
  width: 100%;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  padding: 12px;
}

@media (min-width: 768px) {
  .user-table-mobile-sort {
    display: none;
  }
}

.user-table-mobile-sort-title {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 10px;
}

.user-table-mobile-sort-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-table-mobile-sort-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 500;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease,
    color 0.12s ease;
}

.user-table-mobile-sort-button:hover {
  background-color: #f9fafb;
  border-color: #c7cdd6;
}

.user-table-mobile-sort-icon {
  font-size: 12px;
  color: #9ca3af;
}

.user-table-wrapper {
  display: none;
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

@media (min-width: 768px) {
  .user-table-wrapper {
    display: block;
  }
}

.user-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
}

.user-table-head {
  background-color: #f9fafb;
}

.user-table-header-cell {
  padding: 10px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.user-table-header-actions {
  text-align: right;
}

.user-table-sort-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  padding: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.user-table-sort-button:hover {
  color: #2563eb;
}

.user-table-sort-icon {
  font-size: 11px;
  color: #9ca3af;
}

.user-table-body {
  background-color: #ffffff;
}

.user-table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.12s ease;
}

.user-table-row:hover {
  background-color: #f9fafb;
}

.user-table-cell {
  padding: 10px 16px;
  font-size: 13px;
  color: #4b5563;
  white-space: nowrap;
}

.user-table-cell.strong {
  color: #111827;
  font-weight: 500;
}

.user-table-cell-actions {
  text-align: right;
}

.user-table-actions {
  display: inline-flex;
  gap: 8px;
}

.btn-table {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 500;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.12s ease, border-color 0.12s ease;
}

.btn-table:hover {
  background-color: #f9fafb;
}

.btn-table-danger {
  border-color: #fecaca;
  background-color: #fef2f2;
  color: #b91c1c;
}

.btn-table-danger:hover {
  background-color: #fee2e2;
}
</style>


