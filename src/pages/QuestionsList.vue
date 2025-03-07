<script setup lang="ts">
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import QuestionsCard from '@/components/Questions/QuestionsCard.vue';
import { useQuestionsStore } from '@/stores/useQuestionsStore';

const questionsStore = useQuestionsStore();
</script>

<template>
  <div class="questions">
    <TitleWrapper title="Вопросы" subtitle="Список вопросов и ответов" />
    <div class="questions__list">
      <QuestionsCard
        v-for="item in questionsStore.messageList"
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

  &__list {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
}
</style>