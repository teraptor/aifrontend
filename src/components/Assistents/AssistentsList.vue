<script setup lang="ts">
import TitleWrapper from '../ui/TitleWrapper.vue';
import AssistentsCard from './AssistentsCard.vue';
import { useAssistentsStore } from '@/stores/useAssistentsStore';

const assistents = useAssistentsStore()
</script>

<template>
  <div class="assistents">
    <TitleWrapper
      title="Ассистенты"
      subtitle="Prompts & Plugins GPTs"
    />
    <div class="assistents__list">
      <AssistentsCard
        v-for="item in assistents.assistents"
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
  align-items: center;
  gap: 16px;

  &__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}
</style>