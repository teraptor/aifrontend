<script setup lang="ts">
import { ref } from 'vue';
import TitleWrapper from '../ui/TitleWrapper.vue';
import { useFAQStore } from '@/stores/useFAQStore';

const FAQ = useFAQStore()
const openFAQId = ref<string | null>(null);

const openFAQ = (id: string):void => {
  openFAQId.value = openFAQId.value === id ? null : id;
}
</script>

<template>
  <div class="faq">
    <TitleWrapper
      title="FAQ"
      subtitle="Может быть полезно"
    />
    <ul class="faq__items">
      <li class="faq__item" v-for="item in FAQ.FAQ" :key="item.id">
        <div class="faq__item-title-wrapper" @click="openFAQ(item.id)">
          <span class="faq__item-icon-wrapper">
            <span :class=" openFAQId === item.id ? 'icon icon-x' : 'icon icon-plus'"/>
          </span>
          <h4 class="faq__item-title">{{ item.title }}</h4>
        </div>
        <p v-show="openFAQId === item.id" class="faq__item-description">{{ item.description }}</p>
      </li>
    </ul>
  </div>
</template>
<style lang="scss" scoped>
  .faq {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    background-color: $light-color;
    padding: 13px 20px;
    border-radius: 12px;
    border: 1px solid #e6e8ec;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    &__items {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
    }

    &__item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;

      &-title-wrapper {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      &-icon-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid rgba($help-color, 0.15);
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
          font-size: 12px;
        }
      }

      &-title {
        font-weight: 500;
        line-height: 1.5;
        font-size: 20px;
      }

      &-description {
        line-height: 1.8;
        padding: 0 16px 16px 30px;
      }
    }
  }
</style>