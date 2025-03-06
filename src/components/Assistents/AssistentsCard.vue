<script setup lang="ts">
import type { IAssistent } from '@/stores/useAssistentsStore';

const props = defineProps({
  assistents: {
    type: Object as () => IAssistent,
    required: true,
  },
})

const { assistents } = props;

const getCardClass = (assistents: IAssistent | undefined | null): string => {
  if (!assistents) return '';
  return assistents.isLocked ? 'assistents-card--locked' : assistents.isDisabled ? 'assistents-card--disabled' : '';
};
</script>

<template>
  <div :class="['assistents-card', getCardClass(assistents)]">
    <div class="assistents-card__container">
      <img :src="assistents.image" class="assistents-card__image"/>
      <div class="assistents-card__name-wrapper">
        <h4 class="assistents-card__name"> {{ assistents.name }}</h4>
        <p class="assistents-card__summary"> {{ assistents.summary }}</p>
      </div>
    </div>
    <div class="assistents-card__install-wrapper" v-if="!assistents.isLocked && !assistents.isDisabled">
      <p class="assistents-card__install">
        {{ assistents.install }}
      </p>
      <span class="icon icon-arrow-down-outline" />
    </div>
    <div class="assistents-card__lock-container" v-if="assistents.isLocked">
      <p>Скоро</p>
      <span class="icon icon-lock"/>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.assistents-card {
  max-width: 250px;
  width: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: $light-color;
  padding: 20px 10px 10px;
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba($help-color, 20%);

  &:hover {
    transform: scale(1.04);
  }

  &--locked {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: $blur-color;
      border-radius: 16px;
      backdrop-filter: blur(1px);
      cursor: not-allowed;
    }
  }

  &__lock-container {
    position: absolute;
    top: 5%;
    right: 5%;
    font-size: 14px;
    color: $help-color;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .icon {
      font-size: 20px;
    }
  }

  &--disabled {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: $blur-color;
      border-radius: 16px;
      backdrop-filter: blur(1px);
      cursor: not-allowed;
    }
  }

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;

    .icon {
      width: 48px;
      height: 48px;
      border: 2px solid rgba($help-color, 0.1);
      border-radius: 50%;
      color: $help-color;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 500;
    }
  }

  &__image {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  &__name-wrapper {
    width: calc( 100% - 64px - 12px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__name {
    font-weight: 500;
    line-height: 1.5;
  }

  &__summary {
    color: $help-color;
    line-height: 1;
    font-size: 14px;
  }

  &__install-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: $teal-color;
  }

  &__install {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    height: 100%;
  }
}
</style>