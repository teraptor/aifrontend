<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Ассистенты')
</script>

<template>
  <div class="assists-page">
    <h1>{{ title }}</h1>
    <div class="assists-content">
      <!-- Здесь будет контент страницы ассистентов -->
    </div>
  </div>
</template>

<style scoped>
.assists-page {
  padding: 20px;
}

.assists-content {
  margin-top: 20px;
}
</style> 