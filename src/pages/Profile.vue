<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { computed, ref } from 'vue';

const authStore = useAuthStore();

const currentUser = computed(() => {
  if (authStore.currentUserId) {
    return authStore.getUserProfile(authStore.currentUserId.toString());
  }
  return null;
});

</script>

<template>
  <div v-if="currentUser" class="personal-cabinet">
    <div class="personal-cabinet__header">
      <TitleWrapper title="Личный кабинет" subtitle="Все, что важно, в одном месте" />
      <Button
        button-type="secondary"
        text="Редактировать профиль"
        :icon="'icon icon-edit-3'"
        type="button"
        size="large"
      />
    </div>

    <div class="personal-cabinet__profile">
      <div class="profile-card">
        <div class="profile-card__header">
          <div class="profile-card__avatar">
            {{ currentUser.email.charAt(0).toUpperCase() }}
          </div>
          <div class="profile-card__info">
            <div class="profile-card__name">{{ currentUser.email }}</div>
            <div class="profile-card__role">{{ currentUser.role }}</div>
          </div>
        </div>

        <div class="profile-card__details">
          <div class="profile-card__detail">
            <span class="profile-card__label">Баланс</span>
            <span class="profile-card__value">{{ currentUser.balance }} </span>
          </div>
          <div class="profile-card__detail">
            <span class="profile-card__label">Создан:</span>
            <span class="profile-card__value">{{ currentUser.created_at }}</span>
          </div>
          <div class="profile-card__detail">
            <span class="profile-card__label">Обновлен:</span>
            <span class="profile-card__value">{{ currentUser.updated_at }}</span>
          </div>
          <div class="profile-card__detail">
            <span class="profile-card__label">Компания:</span>
            <span class="profile-card__value">{{ currentUser.company_id }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="personal-cabinet__sections">
      <div class="section">
        <h4 class="section__title">Настройки</h4>
        <div class="section__content">
          <p class="section__content-text">Здесь можно настроить уведомления, безопасность и другие параметры.</p>
          <Button
            button-type="secondary"
            text="Перейти к настройкам"
            type="button"
            size="medium"
            :disabled="true"
          />
        </div>
      </div>

      <div class="section">
        <h4 class="section__title">История баланса</h4>
        <div class="section__content">
          <p class="section__content-text">Просмотрите историю пополнения баланса вашего аккаунта.</p>
          <Button
            button-type="secondary"
            text="Показать историю"
            type="button"
            size="medium"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.personal-cabinet {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: stretch;
  gap: 24px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    width: 100%;

    & > :nth-child(2) {
      width: 40%;
    }
  }

  .profile-card {
    background: $light-color;
    border-radius: 12px;
    box-shadow: $box-shadow-large;
    padding: 20px;

    &__header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    &__avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: $main-color;
      color: $light-color;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__name {
      font-size: 18px;
      font-weight: 600;
      color: #333333;
    }

    &__role {
      font-size: 14px;
      color: $help-color;
      font-weight: 500;
    }

    &__details {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid $light-grey-color;
    }

    &__detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }

    &__label {
      color: $help-color;
      font-weight: 500;
    }

    &__value {
      color: $dark-color;
      font-weight: 600;
    }
  }

  .personal-cabinet__sections {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    .section {
      background: $light-color;
      border-radius: 12px;
      box-shadow: $box-shadow-small;
      padding: 20px;
      display: flex;
      flex-direction: column;
      text-align: start;
      gap: 12px;

      &__title {
        font-size: 16px;
        font-weight: 600;
      }

      .section__content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        &-text {
          font-size: 14px;
          color: $help-color;
        }
      }
    }
  }
}
</style>