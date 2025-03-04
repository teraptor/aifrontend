<script lang="ts" setup>
</script>
<template>
  <header class="header">
    <div class="header__items">
      <div class="header__item">
        <span class="icon icon-world"/>
      </div>
      <div class="header__select">Быстрый выбор</div>
      <div class="header__item">
        <span class="icon icon-paintbrush"/>
      </div>
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

  &__item {
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(249 250 251), 0.5;
    border-radius: 8px;
    backdrop-filter: blur(30px);
    cursor: pointer;

    .icon {
      font-size: 26px;
      font-weight: 600;
      color: $help-color;
    }
  }

  &__select {
    padding: 10px 16px;
    border-radius: 16px;
    background-color: $light-grey-color;
    backdrop-filter: blur(30px);
    cursor: pointer;
    font-weight: 600;
  }
}

</style>