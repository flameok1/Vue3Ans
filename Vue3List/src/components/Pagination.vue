<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}>();

const emits = defineEmits<{
  (e: 'change', page: number): void;
}>();

const canPrev = computed(() => props.page > 1);
const canNext = computed(() => props.page < props.totalPages);

function goTo(page: number) {
  if (page < 1 || page > props.totalPages || page === props.page) return;
  emits('change', page);
}
</script>

<template>
  <div class="pagination">
    <div>
      顯示第
      <span class="pagination-highlight">
        {{ (page - 1) * pageSize + 1 }}
      </span>
      筆到
      <span class="pagination-highlight">
        {{ Math.min(page * pageSize, total) }}
      </span>
      筆，共
      <span class="pagination-highlight">
        {{ total.toLocaleString() }}
      </span>
      筆
    </div>
    <div class="pagination-controls">
      <button
        type="button"
        class="pagination-button"
        :disabled="!canPrev"
        @click="goTo(page - 1)"
      >
        上一頁
      </button>
      <span class="pagination-page-text">
        第 {{ page }} / {{ totalPages }} 頁
      </span>
      <button
        type="button"
        class="pagination-button"
        :disabled="!canNext"
        @click="goTo(page + 1)"
      >
        下一頁
      </button>
    </div>
  </div>
</template>

