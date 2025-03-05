<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Инструменты AI')
</script>

<template>
  <div class="instruments-page">
    <h1>{{ title }}</h1>
    <div class="instruments-content">
      <!-- Здесь будет контент страницы инструментов -->
    </div>
  </div>
</template>

<style scoped>
.instruments-page {
  padding: 20px;
}

.instruments-content {
  margin-top: 20px;
}
</style> 