<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { User } from '../types/user';

const props = defineProps<{
  modelValue: boolean;
  user?: User | null;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', payload: Omit<User, 'id'>, id?: number): void;
}>();

const form = reactive<Omit<User, 'id'>>({
  username: '',
  position: '',
  location: '',
  age: 18,
  birthdate: '',
  order: 0,
});

const isEdit = computed(() => !!props.user);

watch(
  () => props.user,
  (user) => {
    if (user) {
      form.username = user.username;
      form.position = user.position;
      form.location = user.location;
      form.age = user.age;
      form.birthdate = user.birthdate;
      form.order = user.order;
    } else {
      form.username = '';
      form.position = '';
      form.location = '';
      form.age = 18;
      form.birthdate = '';
      form.order = 0;
    }
  },
  { immediate: true },
);

function close() {
  emits('update:modelValue', false);
}

function handleSubmit() {
  emits('submit', { ...form }, props.user?.id);
}
</script>

<template>
  <div v-if="modelValue" class="user-modal" role="dialog" aria-modal="true">
    <div class="user-modal-header">
      <h2 class="user-modal-title">
        {{ isEdit ? '編輯使用者' : '新增使用者' }}
      </h2>
      <button
        type="button"
        class="user-modal-close"
        @click="close"
      >
        ✕
      </button>
    </div>

    <form class="user-modal-form" @submit.prevent="handleSubmit">
      <div class="user-modal-grid">
        <div>
          <label class="form-label">使用者名稱</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="form-input"
          />
        </div>
        <div>
          <label class="form-label">職位</label>
          <input
            v-model="form.position"
            type="text"
            required
            class="form-input"
          />
        </div>
      </div>

      <div class="user-modal-grid">
        <div>
          <label class="form-label">地點</label>
          <input
            v-model="form.location"
            type="text"
            required
            class="form-input"
          />
        </div>
        <div>
          <label class="form-label">年齡</label>
          <input
            v-model.number="form.age"
            type="number"
            min="0"
            required
            class="form-input"
          />
        </div>
      </div>

      <div>
        <label class="form-label">生日</label>
        <input
          v-model="form.birthdate"
          type="date"
          required
          class="form-input"
        />
      </div>

      <div>
          <label class="form-label">Order</label>
          <input
          v-model.number="form.order"
          type="number"
          min="0"
          required
          class="form-input"
        />
      </div>

      <div class="user-modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="close"
        >
          取消
        </button>
        <button
          type="submit"
          class="btn btn-primary"
        >
          {{ isEdit ? '儲存變更' : '新增' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.user-modal {
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

.user-modal-form {
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  background-color: #ffffff;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.4);
}

.user-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.user-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.user-modal-close {
  border: none;
  border-radius: 999px;
  padding: 4px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.user-modal-close:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.user-modal-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

@media (min-width: 768px) {
  .user-modal-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  display: block;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  padding: 8px 12px;
  font-size: 13px;
  color: #111827;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb33;
}

.user-modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  border-radius: 8px;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.btn-secondary {
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.16);
}

.btn-primary:hover {
  background-color: #1d4ed8;
}
</style>

