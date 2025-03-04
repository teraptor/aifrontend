<template>
  <Modal 
    ref="modal"
    title="Авторизация"
    help="Для получения логина и пароля обратитесь к вашему администратору"
  >
    <form @submit.prevent="submitForm" class="form">
      <InputField
        v-model="formData.username"
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
        text="Войти"
        :icon="'icon icon-log-in'"
        type="submit"
        size="big"
      />
    </form>
  </Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import InputField from '../ui/InputField.vue';
import Button from '../ui/Button.vue';
import { useAuthStore } from '@/stores/useAuthStore';

const modal = ref<InstanceType<typeof Modal> | null>(null);
const showPassword = ref<boolean>(false);
const authStore = useAuthStore();

const formData = ref({
  username: '',
  password: '',
});

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const submitForm = () => {
  authStore.login(formData.value);

  if (authStore.isAuthenticated) {
    modal.value?.closeModal();
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
</style>