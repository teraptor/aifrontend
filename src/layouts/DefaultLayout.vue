<template>
  <div class="layout">
    <SideMenu v-if="route.meta.showSidebar" />
    <div class="content-wrapper" :class="{ 'content-wrapper--expanded': !SidebarIsOpen }">
      <Header class="header" v-if="route.meta.showHeader"/>
      <main class="main-content">
        <slot />
      </main>
      <Footer class="footer" v-if="route.meta.showFooter"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideMenu from '@/components/layout/SideMenu.vue';
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router'

const route = useRoute()

const layoutStore = useLayoutStore();
const { SidebarIsOpen } = storeToRefs(layoutStore);
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  min-height: 100vh;
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: margin-left 0.3s ease;

  &--expanded {
    margin-left: 280px;
  }
}

.header,
.footer {
  width: 100%;
  max-width: 48rem;
}

.main-content {
  margin-top: 80px;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48rem;
}

</style>