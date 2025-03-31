<script setup lang="ts">
import DefaultLayout from './layouts/DefaultLayout.vue';
import PublicChatLayout from './layouts/PublicChatLayout.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const layout = computed(() => {
  return route.meta.layout || 'default';
});
</script>

<template>
  <component :is="layout === 'default' ? DefaultLayout : PublicChatLayout">
    <router-view></router-view>
  </component>
</template>

