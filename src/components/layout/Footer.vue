<script lang="ts" setup>
import { useLayoutStore } from '@/stores/useLayoutStore';
import dayjs from 'dayjs'
const currentYear: number = dayjs().year()
const layout = useLayoutStore();
</script>
<template>
  <footer class="footer">
    <ul class="footer__items">
      <li class="footer__item" v-for="item in layout.footerNav" :key="item.id">
        <RouterLink :to="item.link" class="footer__item-link">{{ item.link_name }}</RouterLink>
      </li>
    </ul>
    <p class="footer__text">
      Сделано с <span class="icon icon-like"/> в {{ currentYear }}
    </p>
    <div class="footer__contacts">
      <a href="https://web.telegram.org/">
        <span class="icon icon-telegram"/>
      </a>
      <a href="https://workspace.google.com/intl/ru/gmail/">
        <span class="icon icon-mail"/>
      </a>
    </div>
  </footer>
</template>
<style lang="scss" scoped>
.footer {
  width: 100%;
  background: transparent;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;

  &__items {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    background: rgba($help-color, 0.1);
    border-radius: 16px;
  }

  &__item {
    color: $help-color;
    font-size: 12px;
    line-height: 1.4;
    display: flex;

    &:hover {
      color: $dark-color;
    }
  }

  &__text {
    color: $help-color;
    line-height: 1.4;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;

    .icon {
      color: $danger-color;
    }
  }

  &__contacts {
    display: flex;
    gap: 16px;
    margin-bottom: 30px;

    .icon {
      color: $help-color;
      font-size: 28px;

      &:hover {
        color: $primary-color;
      }
    }
  }
}
</style>
