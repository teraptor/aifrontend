<script setup lang="ts">
interface FilterOption {
  id: string;
  label: string;
}

const props = defineProps<{
  options: FilterOption[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const updateFilter = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<template>
  <div class="filter-tabs">
    <button
      v-for="option in options"
      :key="option.id"
      class="filter-tab"
      :class="{ 'filter-tab--active': modelValue === option.id }"
      @click="updateFilter(option.id)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.filter-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: #F3F4F6;
  border-radius: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #111827;
  }

  &--active {
    background: #FFFFFF;
    color: #111827;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}
</style> 