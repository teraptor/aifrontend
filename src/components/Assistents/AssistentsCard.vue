<script setup lang="ts">
const props = defineProps({
  assistents: {
    type: Object,
    required: true,
  },
})

const { assistents } = props;
</script>

<template>
  <div class="assistents-card">
    <div class="assistents-card__container">
      <img v-if="assistents.image" :src="assistents.image" class="assistents-card__image"/>
      <span v-else class="icon icon-picture" />
      <div class="assistents-card__name-wrapper">
        <h4 class="assistents-card__name"> {{ assistents.name }}</h4>
        <p class="assistents-card__summary"> {{ assistents.summary }}</p>
      </div>
    </div>
    <div class="assistents-card__like-wrapper">
      <p class="assistents-card__like">
        {{ assistents.likes }}
      </p>
      <span class="icon icon-like" />
    </div>
    <div class="assistents-card__verified" v-if="assistents.verified">
      <span class="icon icon-verified" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.assistents-card {
  position: relative;
  max-width: 250px;
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: $light-grey-color;
  padding: 12px;
  border-radius: 20px;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: scale(1.04);
  }

  &__container {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 12px;

    .icon {
      width: 64px;
      height: 64px;
      border: 2px solid rgba($help-color, 0.4);
      border-radius: 10px;
      color: $help-color;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-weight: 500;
    }
  }

  &__image {
    width: 64px;
    height: 64px;
    border-radius: 10px;
  }

  &__name-wrapper {
    width: calc( 100% - 64px - 12px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__name {
    font-weight: 600;
    line-height: 1.5;
  }

  &__summary {
    color: $help-color;
    line-height: 1.2;
    font-size: 14px;
  }

  &__like-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 4px;
    max-height: 20px;
  }

  &__like {
    font-size: 14px;
    font-weight: 600;
    color: $help-color;
    line-height: 1.5;
    height: 100%;
  }

  &__verified {
    position: absolute;
    top: 2%;
    right: 2%;

    .icon {
      font-size: 30px;
      color: $main-color;
    }
  }
}
</style>