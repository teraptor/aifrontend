<template>
  <div class="public-chat-layout">
    <div class="public-chat-container">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// Логика layout'а будет добавлена позже при необходимости
</script>

<style lang="scss" scoped>
.public-chat-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.public-chat-container {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 