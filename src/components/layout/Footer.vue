<script lang="ts" setup>
import dayjs from 'dayjs'
const currentYear: number = dayjs().year()
</script>
<template>
  <div class="footer">
    <div class="footer__inner">
    <p class="footer__text">© {{ currentYear }} - Все права защищены</p>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.footer {
  width: 100%;
  border-top: 2px solid $border-light;
  background-color: $light-color;
  box-shadow: $box-shadow;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;

  &__inner {
    max-width: 1320px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__text {
    font-size: 14px;
    font-weight: 300;
    color: $help-color;
  }
}

@media (max-width: 768px) {
  .footer {
    &__inner {
      max-width: 680px;
    }
  }
}

@media (max-width: 480px) {
  .footer {
    &__inner {
      max-width: 480px;
      padding: 0 16px;
    }
  }
}
</style>
