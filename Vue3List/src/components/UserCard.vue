<script setup lang="ts">
import type { User } from '../types/user';

const props = defineProps<{
  users: User[];
}>();

const emits = defineEmits<{
  (e: 'edit', user: User): void;
  (e: 'delete', user: User): void;
}>();
</script>

<template>
  <div class="user-cards">
    <div v-for="user in users" :key="user.id" class="user-card">
      <div class="user-card-header">
        <div>
          <div class="user-card-title">{{ user.username }}</div>
          <div class="user-card-meta">ID: {{ user.id }}</div>
        </div>
        <div class="user-card-actions">
          <button
            type="button"
            class="btn-card"
            @click="$emit('edit', user)"
          >
            編輯
          </button>
          <button
            type="button"
            class="btn-card btn-card-danger"
            @click="$emit('delete', user)"
          >
            刪除
          </button>
        </div>
      </div>
      <div class="user-card-grid">
        <div>
          <div class="user-card-label">職位</div>
          <div class="user-card-value">{{ user.position }}</div>
        </div>
        <div>
          <div class="user-card-label">地點</div>
          <div class="user-card-value">{{ user.location }}</div>
        </div>
        <div>
          <div class="user-card-label">年齡</div>
          <div class="user-card-value">{{ user.age }}</div>
        </div>
        <div>
          <div class="user-card-label">生日</div>
          <div class="user-card-value">{{ user.birthdate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-cards {
  display: block;
  margin-top: 12px;
}

@media (min-width: 768px) {
  .user-cards {
    display: none;
  }
}

.user-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  margin-bottom: 12px;
}

.user-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.user-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.user-card-meta {
  margin-top: 4px;
  font-size: 11px;
  color: #6b7280;
}

.user-card-actions {
  display: inline-flex;
  gap: 8px;
}

.btn-card {
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

.btn-card:hover {
  background-color: #f9fafb;
}

.btn-card-danger {
  border-color: #fecaca;
  background-color: #fef2f2;
  color: #b91c1c;
}

.btn-card-danger:hover {
  background-color: #fee2e2;
}

.user-card-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

.user-card-label {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 2px;
}

.user-card-value {
  font-size: 13px;
}
</style>


