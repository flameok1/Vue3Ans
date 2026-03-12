<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  debounce?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'input-immediate', value: string): void;
}>();

const innerValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = val;
  },
);

watch(innerValue, (val) => {
  emits('input-immediate', val);
  if (!props.debounce) {
    emits('update:modelValue', val);
  }
});
</script>

<template>
  <div class="search-field">
    <label class="search-label">搜尋使用者</label>
    <div class="search-input-wrapper">
      <span class="search-input-icon">
        🔍
      </span>
      <input
        v-model="innerValue"
        type="text"
        placeholder="依使用者名稱、職位、地點搜尋..."
        class="search-input"
      />
    </div>
  </div>
</template>

