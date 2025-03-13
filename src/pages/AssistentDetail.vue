<template>
  <div class="assistent">
    <div class="assistent__header-wrapper">
      <div class="assistent__header-back" @click="goBack">
        <span class="icon icon-arrow-left2" />
        Назад
      </div>
      <TitleWrapper title="Параметры ассистента" />
    </div>
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
  </div>
</template>

<script setup lang="ts">
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';

const assistentsStore = useAssistentsStore();
const router = useRouter();
const route = useRoute();

const assistent = computed(() => assistentsStore.getAssistentById(route.params.id as string)!);

const goBack = (): void => router.back();
</script>

<style lang="scss" scoped>
.assistent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  width: 100%;

  &__header-wrapper {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__header-back {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 4px;
    color: $help-color;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      color: $dark-secondary-color;
    }
  }
}

.assistent-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 48rem;
  gap: 16px;

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
  }

  &__image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
  }

  &__name-wrapper {
    width: calc(100% - 100px - 20px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__name {
    font-weight: 600;
    font-size: 20px;
  }

  &__summary {
    color: $help-color;
    font-size: 14px;
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