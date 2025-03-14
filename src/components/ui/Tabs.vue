<template>
  <div class="tabs">
    <div class="tabs__header">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tabs__tab', { 'tabs__tab--active': activeTab === tab.id }]"
        @click="setActiveTab(tab.id)"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="tabs__content">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  tabs: { id: string; label: string }[];
  initialTab?: string;
}>();

const activeTab = ref(props.initialTab || props.tabs[0]?.id);

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
};

watch(
  () => props.initialTab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab;
    }
  }
);
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  flex-direction: column;
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid rgba($help-color, 0.1);
    width: 100%;
    margin-top: 16px;
  }

  &__tab {
    padding: 8px 16px;
    cursor: pointer;
    font-weight: 500;
    color: $help-color;
    border-radius: 8px 8px 0 0;

    &--active {
      color: $primary-color;
      background-color: rgba($help-color, 0.1);
      font-weight: 600;
    }
  }

  &__content {
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}
</style>