<script setup lang="ts">
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import QuestionsCard from '@/components/Questions/QuestionsCard.vue';
import SortFiltersTab from '@/components/ui/SortFiltersTab.vue';
import { useQuestionsStore } from '@/stores/useQuestionsStore';
import { ref,computed } from 'vue';
import type { FilterOption } from '@/stores/useQuestionsStore';

const questionsStore = useQuestionsStore();

const activeFilter = ref<FilterOption>('all');

const filterLabels: Record<FilterOption, string> = {
  all: 'Все',
  answered: 'Отвеченные',
  unanswered: 'Неотвеченные',
};

const changeFilter = (filter: string) => {
  const filterOption = filter as FilterOption;
  questionsStore.setActiveFilter(filterOption);
  activeFilter.value = filterOption;
};

const filteredQuestions = computed(() => questionsStore.filteredQuestions);
</script>

<template>
  <div class="questions">
    <TitleWrapper title="Вопросы" subtitle="Список вопросов и ответов" />
    <div class="questions__nav-group">
      <SortFiltersTab
        :filterLabels="filterLabels"
        :activeFilter="activeFilter"
        @update:filter="changeFilter"
      />
    </div>
    <div class="questions__list">
      <QuestionsCard
        v-for="item in filteredQuestions"
        :key="item.id"
        :message="item"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.questions {
  width: 100%;
  max-width: 48rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;

  &__nav-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
}
</style>