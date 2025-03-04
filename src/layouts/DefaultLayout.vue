<script setup lang="ts">
import SideMenu from '@/components/layout/SideMenu.vue';
import AssistantsList from '@/components/Assistants/AssistantsList.vue';
</script>

<template>
  <div class="layout">
    <SideMenu />
    <main class="main-content">
      <div class="content-container">
        <AssistantsList />
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background-color: white;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>
