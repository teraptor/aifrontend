<template>
  <div class="user-profile" :class="{ 'user-profile--collapsed': collapsed }">
    <div class="user-profile__avatar">
      <span>Y</span>
    </div>
    <div class="user-profile__info" v-if="!collapsed">
      <div class="user-profile__balance">
        <div class="user-profile__balance-label">Баланс:</div>
        <div class="user-profile__balance-amount">1000 ₽</div>
      </div>
      <div class="user-profile__name">Yuriy Bedarev</div>
      <div class="user-profile__link">Перейти в профиль</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  collapsed?: boolean;
}>();
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  margin-top: auto;
  cursor: pointer;
  border-top: 1px solid #E5E7EB;
  background: #FFFFFF;
  position: relative;
}

.user-profile:hover {
  background-color: #F3F4F6;
}

.user-profile__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #5BA4A4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 16px;
}

.user-profile__info {
  flex: 1;
}

.user-profile__name {
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  line-height: 20px;
}

.user-profile__link {
  font-size: 14px;
  color: #6B7280;
  line-height: 20px;
}

.user-profile--collapsed {
  justify-content: center;
  padding: 12px 0;
}

.user-profile__balance {
  background: #F3F4F6;
  padding: 8px 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-profile__balance-label {
  color: #6B7280;
  font-size: 14px;
}

.user-profile__balance-amount {
  color: #111827;
  font-weight: 500;
  font-size: 14px;
}
</style> 