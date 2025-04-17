<template>
  <div :class="['assistents-card', cardClass]" v-if="assistents" @click="goToAssistentDetails">
    <span class="assistents-card__settings-icon icon icon-cog" v-if="route.name === RouteNames.ASSISTENS" @click="goToSetting($event)"/>
    <div class="assistents-card__container">
      <img :src="assistents.image" class="assistents-card__image"/>
      <div class="assistents-card__name-wrapper">
        <h4 class="assistents-card__name"> {{ assistents.name }}</h4>
        <p class="assistents-card__summary"> {{ assistents.summary }}</p>
      </div>
    </div>
    <div class="assistents-card__footer" v-if="cardClass !== 'assistents-card--locked' && authStore.isAuthenticated">
      <div :class="['assistents-card__footer-status', statusClass]">
        {{ statusText }}
      </div>
    </div>
    <div class="assistents-card__lock-container" v-if="cardClass === 'assistents-card--locked'">
      <p>Скоро</p>
      <span class="icon icon-lock"/>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { IAssistent } from '@/stores/useAssistantsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RouteNames } from '@/router/routes/routeNames';

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const props = defineProps({
  assistents: {
    type: Object as () => IAssistent,
    required: true,
  },
})

const { assistents } = props;

const cardClass = computed(() => {
  if (!assistents) return '';
  return !authStore.isAuthenticated
    ? (!assistents.status ? 'assistents-card--locked' : '')
    : (!assistents.status ? 'assistents-card--disabled' : '');
});

const statusClass = computed(() => {
  if (!assistents) return '';
  return assistents.status ? 'assistents-card__footer-status--active' : 'assistents-card__footer-status--inactive';
});

const statusText = computed(() => {
  if (!assistents) return '';
  return assistents.status ? 'Активный' : 'Неактивный';
});

const goToAssistentDetails = () => {
  if (cardClass.value !== 'assistents-card--locked') {
    router.push({ name: RouteNames.ASSISTENT_DETAIL, params: { id: assistents.id } });
  }
};

const goToSetting = (event: MouseEvent) => {
  event.stopPropagation();
  router.push({ name: RouteNames.ASSISTENT_SETTING, params: { id: assistents.id } });
}
</script>

<style lang="scss" scoped>
.assistents-card {
  position: relative;
  max-width: 280px;
  width: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: $light-color;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e6e8ec;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $box-shadow-large;
  }

  &--locked {
    position: relative;
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba($light-color, 0.8);
      border-radius: 12px;
      backdrop-filter: blur(2px);
      cursor: not-allowed;
    }
  }

  &__settings-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 18px;
    color: $help-color;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: $main-color;
    }
  }

  &__lock-container {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 14px;
    color: $help-color;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .icon {
      font-size: 18px;
      color: $help-color;
    }
  }

  &--disabled {
    position: relative;
    background-color: $light-grey-color;
    opacity: 0.8;
  }

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__image {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
  }

  &__name-wrapper {
    width: calc(100% - 52px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__name {
    font-weight: 500;
    font-size: 18px;
    line-height: 1.4;
    color: $dark-color;
    margin: 0;
  }

  &__summary {
    color: $help-color;
    line-height: 1.4;
    font-size: 14px;
    margin: 0;
  }

  &__footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid $border-light;

    &-status {
      text-transform: lowercase;
      font-size: 12px;
      font-weight: 500;
      border-radius: 16px;
      padding: 4px 10px;
      color: $light-color;

      &--disabled {
        background-color: $danger-color;
      }

      &--active {
        background-color: $success-color;
      }
      
      &--inactive {
        background-color: $help-color;
      }
    }
  }
}
</style>
@/stores/useAssistantsStore