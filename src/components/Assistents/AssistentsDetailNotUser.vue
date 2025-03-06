<template>
  <div class="assistent-detail" v-if="assistent">
    <div class="assistent-detail__container">
      <img :src="assistent.image" class="assistent-detail__image"/>
      <div class="assistent-detail__name-wrapper">
        <h4 class="assistent-detail__name"> {{ assistent.name }}</h4>
        <p class="assistent-detail__summary"> {{ assistent.summary }}</p>
      </div>
    </div>
    <div class="assistent-detail__description">
    <h4 class="assistent-detail__description-title">Описание:</h4>
    <p class="assistent-detail__description-text">{{ assistent.description }}</p>
    </div>
    <div class="assistent-detail__install">
      <h4 class="assistent-detail__install-title">Количество загрузок:</h4>
      <p class="assistent-detail__install-text">{{ assistent.install }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAssistentsStore } from '@/stores/useAssistentsStore';

const route = useRoute();
const assistentsStore = useAssistentsStore();

const assistent = computed(() => {
  return assistentsStore.assistants.find((a) => a.id === route.params.id);
});
</script>
<style lang="scss">
.assistent-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 48rem;
  gap: 32px;

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
  }

  &__image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  &__name-wrapper {
    width: calc( 100% - 100px - 20px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__name {
    font-weight: 600;
    line-height: 1.5;
    font-size: 24px;
  }

  &__summary {
    color: $help-color;
    line-height: 1.2;
  }

  &__description,
  &__install {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    &-title {
      font-size: 18px;
      font-weight: 600;
    }

    &-text {
      color: $help-color;
    }
  }
}
</style>