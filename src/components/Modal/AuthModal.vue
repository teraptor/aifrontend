<template>
  <Modal
    ref="modal"
    title="Регистрация"
  >
    <form @submit.prevent="submitForm" class="form">
      <InputField
        v-model="formData.email"
        type="tel"
        id="phone"
        placeholder="Логин"
        autocomplete="phone"
        size="big"
      />
      <InputField
        v-model="formData.password"
        :type="showPassword ? 'text' : 'password'"
        id="password"
        placeholder="Пароль"
        autocomplete="current-password"
        :icon="showPassword ? 'icon icon-eye-hidden' : 'icon icon-eye'"
        @icon-click="togglePassword"
        size="big"
      />
      <Button
        button-type="secondary"
        text="Зарегистрироваться"
        :icon="'icon icon-log-in'"
        type="submit"
        size="big"
        :class="{'button-disabled': !isFormValid, 'button-enabled': isFormValid}"
      />
      <div class="login-link">
        Уже есть аккаунт? <a href="#" @click.prevent="switchToLogin">Войти</a>
      </div>
    </form>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import InputField from '../ui/InputField.vue';
import Button from '../ui/Button.vue';
import { useAuthStore } from '@/stores/useAuthStore';

const emit = defineEmits(['switch-to-login']);

const modal = ref<InstanceType<typeof Modal> | null>(null);
const showPassword = ref<boolean>(false);
const authStore = useAuthStore();

const formData = ref({
  email: '',
  password: '',
});

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const isFormValid = computed(() =>{
  const isUsernameValid = formData.value.email.trim().length >= 3
  const isPasswordValid = formData.value.password.trim().length >= 8
  return isUsernameValid && isPasswordValid
})

const switchToLogin = () => {
  modal.value?.closeModal();
  emit('switch-to-login');
}

const submitForm = async () => {
  if (!isFormValid.value) {
    return;
  }
  
  try {
    const success = await authStore.register(formData.value);
    if (success) {
      // Закрываем модальное окно регистрации
      modal.value?.closeModal();
      // Эмитим событие для открытия формы авторизации
      emit('switch-to-login', formData.value.email);
    }
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
  }
};

defineExpose({ openModal: () => modal.value?.openModal() });
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  width: 80%;
  margin: 0 auto;
}

.button-disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}

.login-link {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #1890ff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
