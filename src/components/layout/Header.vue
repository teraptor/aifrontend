<script lang="ts" setup>
</script>
<template>
  <div class="header">
    <div class="header__inner">
      <div class="header__logo">
        <RouterLink to="/">
          <img src="@/assets/logo.png" alt="logo" class="logo"/>
        </RouterLink>
      </div>
    </div>
  </div>

</template>
<style lang="scss" scoped>

.header {
  width: 100%;
  border-bottom: 2px solid $border-light;
  background-color: $light-color;
  padding: 10px 16px;
  box-shadow: $box-shadow;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 100;

  &__inner {
    max-width: 1320px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .logo {
    width: 160px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .header {
    &__inner {
      max-width: 680px;
    }
  }
}

@media (max-width: 480px) {
  .header {
    &__inner {
      max-width: 480px;
      padding: 0 16px;
    }
  }
}
</style>