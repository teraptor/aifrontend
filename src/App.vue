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

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700;900&display=swap');

:root {
  font-family: 'Roboto', sans-serif;
}

* {
  font-family: 'Roboto', sans-serif;
}

body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
}
</style>

