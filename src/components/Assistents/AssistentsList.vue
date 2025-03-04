<script setup lang="ts">
import { ref, computed } from 'vue';
import TitleWrapper from '../ui/TitleWrapper.vue';
import AssistentsCard from './AssistentsCard.vue';
import { useAssistentsStore } from '@/stores/useAssistentsStore';

const assistentsStore = useAssistentsStore();
const activeTab = ref<'popular' | 'new'>(assistentsStore.sortOption);

const changeSortOption = (option: 'popular' | 'new') => {
  assistentsStore.setSortOption(option);
  activeTab.value = option;
};

const sortedAssistents = computed(() => assistentsStore.sortedAssistents());
</script>

<template>
  <div class="assistents">
    <TitleWrapper title="Ассистенты" subtitle="Prompts & Plugins GPTs" />

    <div class="assistents__tabs">
      <div
        v-for="(label, key) in { popular: 'Популярные', new: 'Новые' }"
        :key="key"
        class="assistents__tab"
        :class="{ active: activeTab === key }"
        @click="changeSortOption(key)"
      >
        {{ label }}
      </div>
    </div>
    <div class="assistents__list">
      <AssistentsCard
        v-for="item in sortedAssistents"
        :key="item.id"
        :assistents="item"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assistents {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;

  &__tabs {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    width: 30%;
  }

  &__tab {
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

  &__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}
</style>