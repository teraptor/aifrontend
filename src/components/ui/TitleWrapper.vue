<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="title-wrapper">
    <h1 class="title">{{ title }}</h1>
    <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped lang="scss">
.title-wrapper {
  width: 100%;
  margin-bottom: 8px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}
</style>