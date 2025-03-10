<script setup lang="ts">
import { ref } from 'vue'
import MyAssists from '@/components/Assistents/MyAssists.vue'
</script>

<template>
  <div class="assists-page">
    <div class="assists-content main-content">
      <MyAssists />
    </div>
  </div>
</template>

<style scoped>
.assists-page {
}

.assists-content {
  margin-top: 20px;
}

.main-content {
  margin-top: 15px;
}
</style> 