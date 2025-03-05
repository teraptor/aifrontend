<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore';

import { useRouter } from 'vue-router';
const router = useRouter();
const userStore = useUserStore();

const goToProfile = ():void => {
  router.push('profile')
} 
</script>
<template>
    <div class="profile" @click="goToProfile">
      <div class="profile__avatar">
        <span class="profile__avatar-letter">{{userStore.user.name[0]}}</span>
      </div>
      <div class="profile__info">
        <div class="profile__info-name">{{userStore.user.name}} {{ userStore.user.surname }}</div>
        <div class="profile__info-action">Перейти в профиль</div>
      </div>
    </div>
</template>
<style lang="scss" scoped>
.profile {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  width: 100%;
  cursor: pointer;
  background: transparent;

  &:hover {
    background: $light-grey-color;
  }

  &__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $teal-color;
    display: flex;
    align-items: center;
    justify-content: center;

    &-letter {
      color: $light-color;
      font-size: 14px;
      font-weight: 500;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;

    &-name {
      font-size: 14px;
      font-weight: 500;
      color: $dark-color;
    }

    &-action {
      font-size: 12px;
      color: $help-color;
    }
  }
}
</style>
