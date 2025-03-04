<script setup lang="ts">
const props = defineProps({
  title: {
    text: String,
    default: ''
  },
  subtitle: {
    text: String,
    default: ''
  }
})
</script>
<template>
<div class="title-wrapper">
  <h4 class="title">
    {{ props.title }}
  </h4>
  <p class="subtitle">{{ props.subtitle }}</p>
</div>
</template>
<style lang="scss" scoped>
.title-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .title {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.5;
  }

  .subtitle {
    font-size: 14px;
    color: $help-color;
    font-weight: 300;
    line-height: 1.25;
  }
}
</style>