<script setup lang="ts">
import { computed, ref } from 'vue';
import TitleWrapper from '../ui/TitleWrapper.vue';
import AssistentsCard from './AssistentsCard.vue';
import SortFiltersTab from '../ui/SortFiltersTab.vue';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import type { SortOption, FilterOption } from '@/stores/useAssistentsStore';

const assistentsStore = useAssistentsStore();
const activeTab = ref<SortOption>(assistentsStore.sortOption);
const activeFilter = ref<FilterOption>('all');

const filterLabels: Record<FilterOption, string> = {
  all: 'Все',
  business: 'Бизнес',
  author: 'Автор',
};

const sortLabels: Record<SortOption, string> = {
  popular: 'Популярные',
  new: 'Новые',
};


const changeSortOption = (option: string) => {
  const sortOption = option as SortOption;
  assistentsStore.setSortOption(sortOption);
  activeTab.value = sortOption;
};

const changeFilter = (filter: string) => {
  const filterOption = filter as FilterOption;
  activeFilter.value = filterOption;
  assistentsStore.setActiveFilter(filterOption);
};

const filteredAssistents = computed(() => assistentsStore.sortedAssistents);
</script>

<template>
  <div class="assistents">
    <TitleWrapper title="Ассистенты" subtitle="Prompts & Plugins GPTs" />

    <SortFiltersTab
      :sortLabels="sortLabels"
      :filterLabels="filterLabels"
      :activeTab="activeTab"
      :activeFilter="activeFilter"
      @update:sort="changeSortOption"
      @update:filter="changeFilter"
    />

    <div class="assistents__list">
      <AssistentsCard
        v-for="item in filteredAssistents"
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

  &__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}
</style>