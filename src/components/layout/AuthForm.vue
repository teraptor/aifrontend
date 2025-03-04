<template>
    <AuthModal 
      ref="authModal" 
      title="Авторизация"
      help="Для получения логина и пароля обратитесь к вашему администратору"
    />
  <div class="auth-form">
    <h2>Войти или зарегистрироваться</h2>
    <p class="subtitle">используя социальную сеть</p>

    <div class="social-buttons">
      <button class="social-button yandex">
        <img src="@/assets/icons/yandex.svg" alt="Яндекс" />
        Войти через Яндекс
      </button>

      <button class="social-button google">
        <img src="@/assets/icons/google.svg" alt="Google" />
        Войти через Google
      </button>
    </div>

    <div class="divider">
      <span>или</span>
    </div>

    <div class="alternative-auth">
      <button class="auth-button email">
        <img src="@/assets/icons/email.svg" alt="Email" />
        Через эл.почту
      </button>
    </div>

    <button class="login-password" @click="openAuthModal">
      У меня есть логин/пароль
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AuthModal from '@/components/Modal/AuthModal.vue';


const authModal = ref<InstanceType<typeof AuthModal> | null>(null);

const openAuthModal = () => {
  authModal.value?.openModal();
};
</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 260px;
  margin: 0 auto;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  text-align: center;
}

.subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: -1rem 0 0;
  text-align: center;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
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

.social-button:hover {
  background: #f9fafb;
}

.social-button img {
  width: 1.5rem;
  height: 1.5rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  width: 100%;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.divider span {
  margin: 0 0.5rem;
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