<script setup lang="ts">
import AssistentsList from '@/components/Assistents/AssistentsList.vue';
import FAQ from '@/components/FAQ/FAQ.vue';
</script>
<template>
  <div class="main">
    <AssistentsList />
    <FAQ/>
  </div>
</template>
<style lang="scss" scoped>
.main {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
}
</style>