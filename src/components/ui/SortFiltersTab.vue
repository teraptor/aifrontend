<script setup lang="ts">

const props = defineProps<{
  sortLabels?: Record<string, string>;
  filterLabels: Record<string, string>;
  activeTab?: string;
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
    <div class="tabs" v-if="props.sortLabels">
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
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    flex: 1;

    .tabs {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 24px;
    } 

    .tab {
      font-size: 14px;
      color: $help-color;
      font-weight: 500;
      line-height: 1.4;
      cursor: pointer;
      padding: 8px 0;
      position: relative;
      transition: all 0.2s ease;

      &:hover {
        color: $dark-color;
      }

      &.active {
        color: $dark-color;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: $main-color;
          border-radius: 2px;
        }
      }
    }
  }
</style>