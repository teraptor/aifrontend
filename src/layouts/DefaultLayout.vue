<template>
  <div class="layout">
    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
    <SideMenu v-if="route.meta.showSidebar" />
    <RightSideMenu v-if="route.name === RouteNames.CREATE_ASSISTENT"/>
    <div class="content-wrapper" :class="{ 'content-wrapper--expanded': !SidebarIsOpen, 'content-wrapper--right-expanded': !RightSidebarIsOpen }">
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouteNames } from '@/router/routes/routeNames';
import SideMenu from '@/components/layout/SideMenu.vue';
import RightSideMenu from '@/components/layout/RightSideMenu.vue';
import Footer from '@/components/layout/Footer.vue';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router'
import { Notivue, Notification } from 'notivue'

const route = useRoute()

const layoutStore = useLayoutStore();
const { SidebarIsOpen, RightSidebarIsOpen } = storeToRefs(layoutStore);
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  min-height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  // background: linear-gradient(180deg, #0A0F1C 0%, #1A1F2E 100%);
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: margin-left 0.3s ease, margin-right 0.3s ease;

  &--expanded {
    margin-left: 250px;
  }
}

.main-content {
  // margin-top: 20px;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
