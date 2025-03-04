<template>
  <div class="layout">
    <SideMenu />
    <main class="main-content">
      <div class="content-container">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import SideMenu from '@/components/layout/SideMenu.vue';
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background-color: white;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
  margin-left: 280px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 2.5rem;
}
</style> 