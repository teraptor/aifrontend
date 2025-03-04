<script lang="ts" setup>
</script>
<template>
  <header class="header">
    <div class="header__items">
    </div>
  </header>
</template>
<style lang="scss" scoped>
.header {
  width: 100%;
  height: 60px;
  position: fixed;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  &__items {
    width: 100%;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>