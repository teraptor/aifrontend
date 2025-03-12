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
import type { IAssistent } from '@/stores/useAssistentsStore';

const props = defineProps({
  assistent: {
    type: Object as () => IAssistent,
    required: true,
  },
})

const { assistent } = props;
</script>
<style lang="scss">
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
    width: calc( 100% - 100px - 20px);
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