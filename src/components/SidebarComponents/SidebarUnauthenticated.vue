<template>
  <LoginModal 
    ref="loginModal" 
    title="Войти"
    help="Для получения логина и пароля обратитесь к вашему администратору"
  />
  <AuthModal 
    ref="authModal" 
    title="Регистрация"
    help="Никому не сообщайте логин и пароль"
  />
  <div class="auth-variants">
    <div class="auth-variants__title-wrapper">
      <h2 class="auth-variants__title">Войти или зарегистрироваться</h2>
      <p class="auth-variants__subtitle">используя социальную сеть</p>
    </div>
    <div class="auth-variants__buttons-group">
      <Button
        type="button"
        button-type="light"
        text="Войти через Yandex"
        size="big"
        image="yandex.svg"
      />

      <Button
        type="button"
        button-type="light"
        text="Войти через Google"
        size="big"
        image="google.svg"
      />
    </div>

    <div class="auth-variants__divider">
      <span>или</span>
    </div>

    <div class="auth-variants__buttons-group">
      <Button
        type="button"
        button-type="light"
        text="Войти через почту"
        size="big"
        image="email.svg"
      />
      <Button
        type="button"
        @click="openLoginModal"
        button-type="light"
        text="У меня есть логин/пароль"
        size="big"
      />
      <Button
        type="button"
        @click="openAuthModal"
        button-type="text"
        text="Зарегистрироваться"
        size="big"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoginModal from '../Modal/LoginModal.vue';
import Button from '../ui/Button.vue';
import AuthModal from '../Modal/AuthModal.vue';

const loginModal = ref<InstanceType<typeof LoginModal> | null>(null);
const authModal = ref<InstanceType<typeof AuthModal> | null>(null);

const openLoginModal = () => {
  loginModal.value?.openModal();
};

const openAuthModal = () => {
  authModal.value?.openModal();
};

</script>

<style lang="scss" scoped>
.auth-variants {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 250px;
  align-items: center;
  width: 100%;

  &__title-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  &__title {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.5;
  }

  &__subtitle {
    font-size: 14px;
    line-height: 1.25;
    color: $help-color;
  }

  &__buttons-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__divider {
    display: flex;
    align-items: center;
    text-align: center;
    gap: 8px;
    color: $help-color;
    font-size: 14px;
    width: 100%;

    &::before,
    &::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid $light-grey-color;
    }
  }
}

.alternative-auth {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.auth-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.auth-button img {
  width: 1.25rem;
  height: 1.25rem;
}

.auth-button:hover {
  background: #f9fafb;
}

.login-password {
  padding: 0.75rem;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s;
  width: 100%;
  text-align: center;
}

.login-password:hover {
  color: #111827;
}
</style> 