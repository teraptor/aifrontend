<script setup lang="ts">

const props = defineProps<{
  sortLabels: Record<string, string>;
  filterLabels: Record<string, string>;
  activeTab: string;
  activeFilter: string;
}>();

const emit = defineEmits<{
  (e: 'update:sort', value: string): void;
  (e: 'update:filter', value: string): void;
}>();

const changeSortOption = (option: string) => {
  emit('update:sort', option);
};

const changeFilter = (filter: string) => {
  emit('update:filter', filter);
};
</script>

<template>
  <div class="tabs-container">
    <div class="tabs">
      <div
        v-for="(label, key) in sortLabels"
        :key="key"
        class="tab"
        :class="{ active: activeTab === key }"
        @click="changeSortOption(key)"
      >
        {{ label }}
      </div>
    </div>

    <div class="tabs">
      <div
        v-for="(label, key) in filterLabels"
        :key="key"
        class="tab"
        :class="{ active: activeFilter === key }"
        @click="changeFilter(key)"
      >
        {{ label }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .tabs-container {
    width: 50%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .tabs {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 16px;
      width: 50%;
    } 

    .tab {
      font-size: 14px;
      color: $help-color;
      font-weight: 300;
      line-height: 1.5;
      cursor: pointer;

      &.active {
        border-bottom: 1px solid $dark-color;
        color: $dark-color;
      }
    }
  }
</style>