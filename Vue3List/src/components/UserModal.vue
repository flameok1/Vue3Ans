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
    } else {
      form.username = '';
      form.position = '';
      form.location = '';
      form.age = 18;
      form.birthdate = '';
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

