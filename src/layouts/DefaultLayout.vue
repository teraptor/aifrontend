<template>
  <div class="layout">
    <SideMenu />
    <main class="main-content" :class="{ 'main-content--expanded': !SidebarIsOpen }">
      <div class="main-content__container">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import SideMenu from '@/components/layout/SideMenu.vue';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { storeToRefs } from 'pinia';

const layoutStore = useLayoutStore();
const { SidebarIsOpen } = storeToRefs(layoutStore);
</script>

<style scoped lang="scss">
.layout {
  display: flex;

  .main-content {
    flex-grow: 1;
    transition: margin-left 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;

    &-container {
      width: 48rem;
    }
  }

  .main-content--expanded {
    margin-left: 280px;
  }
}
</style>