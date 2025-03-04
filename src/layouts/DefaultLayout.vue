<script setup lang="ts">
import { Notivue, Notification } from 'notivue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';
const route = useRoute()
</script>

<template>
  <div class="layout" v-cloak>
    <Notivue v-slot="item">
      <Notification :item="item" />
    </Notivue>
    <Header v-if="route.meta.showHeader" />
    <div class="main-content">
      <div class="main-content-inner">
        <slot />
      </div>
    </div>
    <Footer v-if="route.meta.showFooter" />
  </div>
</template>
<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .main-content {
    padding: 20px;
    display: flex;
    flex-grow: 1;
    width: 100%;
    height: 100%;
    flex-direction: column;

    align-items: center;

    &-inner {
      width: 48rem;
    }
  }
}
</style>
