<!-- компонент не используется -->
<template>
  <router-link :to="to" class="menu-item" :class="{ 'menu-item--collapsed': collapsed }">
    <div class="menu-item__icon">
      <slot name="icon"></slot>
    </div>
    <span class="menu-item__text" v-if="!collapsed">{{ text }}</span>
    <slot name="arrow" v-if="!collapsed"></slot>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  text: string;
  collapsed?: boolean;
}>();
</script>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #111827;
  gap: 12px;
  border-radius: 12px;
  margin: 4px 8px;
  background: #FFFFFF;
  min-height: 48px;
}

.menu-item:hover {
  background-color: #F3F4F6;
}

.menu-item__icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
}

.menu-item__text {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}

.menu-item--collapsed {
  justify-content: center;
  padding: 12px 0;
  width: 48px;
  margin: 4px auto;
}
</style> 