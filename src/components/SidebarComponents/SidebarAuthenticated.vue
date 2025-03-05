<script setup lang="ts">
import Button from '../ui/Button.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import User from '../User/User.vue';

const authStore = useAuthStore()

const logout = () => authStore.logout()
</script>
<template>
  <div class="menu">
    <User />
    <Button
      button-type="danger"
      text="Выйти"
      @click="logout"
      size="large"
    />
  </div>
</template>
<style lang="scss" scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 250px;
  align-items: center;
  width: 100%;
}
</style>
