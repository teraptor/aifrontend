<script lang="ts" setup>
import HelpChat from '@/components/HelpChat/HelpChat.vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import { useMainContentStore } from '@/stores/useMainContentStore';

const mainContent = useMainContentStore()
</script>
<template>
  <div class="intro">
    <div class="intro__inner">
      <div class="intro__title-container">
        <h2 class="intro__title">Революционизируйте свою команду поддержки с OmniChannel AI Chatbot</h2>
        <p class="intro__subtitle">Дайте вашей команде поддержки возможность использовать наш AI чатбот. Улучшите эффективность, сократите время ответа и повысьте удовлетворенность клиентов.</p>
      </div>
      <div class="intro__help-chat">
        <HelpChat width="100%" height="60vh"/>
      </div>
    </div>
  </div>
  <div class="install">
    <div class="install__inner">
      <TitleWrapper
        title="Установите своего персонального ассистента с искусственным интеллектом"
        subtitle="Увеличь количество продаж через консультации в чате с использованием чат-бота"
      />
      <div class="install__items">
        <div v-for="item in mainContent.install" :key="item.count" class="install__item">
          <h4 class="install__item-title">
            <span class="install__item-count">{{ item.count }}</span>
            {{ item.title }}
          </h4>
          <ul class="install__item-subitems">
            <li v-for="(text, index) in item.list" :key="index" class="install__item-subitem">
              {{ text }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="advantages">
    <div class="advantages__inner">
      <TitleWrapper
        title="Все для усиления и автоматизации продаж"
        subtitle="в одном сервисе, без ошибок и толпы менеджеров"
      />
      <div class="advantages__items">
        <div class="advantages__item" v-for="item in mainContent.advantages" :key="item.id">
          <span :class="['icon', item.icon]"/>
          <h4 class="advantages__item-title">{{ item.title }}</h4>
          <p class="advantages__item-subtitle"> {{ item.subtitle }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.intro {
  padding: 40px 16px;
  background-image: url(@/assets/intro.jpg);
  position: relative;
  margin: auto;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: rgba($main-color, 0.4);
    z-index: 1;
  }

  &__inner {
    position: relative;
    z-index: 10;
    max-width: 1320px;
    width: 100%;
    margin: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
  }

  &__title-container {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 16px;
    text-align: start;
  }

  &__title {
    font-size: 36px;
    font-weight: 500;
    line-height: 1.3;
    color: $light-color;
  }

  &__subtitle {
    font-size: 20px;
    line-height: 1.2;
    color: #f0f0f0;
  }

  &__image {
    width: 250px;
    height: 250px;
  }

  &__help-chat {
    width: 50%;
  }
}

.install {
  padding: 40px 16px;
  background-color: $light-color;

  &__inner {
    max-width: 1320px;
    padding-top: 32px;
    width: 100%;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  &__items {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    gap: 20px;
  }

  &__item {
    width: 30%;
    padding: 24px;
    background-color: $light-grey-color;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    border-radius: 16px;

    &-title {
      font-size: 20px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      width: 100%;
    }

    &-count {
      font-size: 16px;
      color: $light-color;
      background-color: $main-color;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 30px;
      width: 30px;
      border-radius: 50%;
    }

    &-subitems {
      display: flex;
      flex-direction: column;
      gap: 8px;
      list-style-type: disc;
      padding-left: 25px;
      font-size: 18px;
      color: $help-color;
    }

    &-subitem {
      line-height: 1.2;
    }
  }
}

.advantages {
  padding: 40px 16px;
  background-color: $light-grey-color;

  &__inner {
    max-width: 1320px;
    padding-top: 32px;
    width: 100%;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 20px;
    width: 100%;

    .icon {
      font-size: 24px;
      color: $main-color;
    }

    .advantages__item:nth-child(1),
    .advantages__item:nth-child(2),
    .advantages__item:nth-child(4),
    .advantages__item:nth-child(6) {
      width: calc(25% - 20px);
    }

    .advantages__item:nth-child(3),
    .advantages__item:nth-child(5) {
      width: 50%;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    border: 2px solid $border-light;
    padding: 32px;
    background-color: $light-color;
    border-radius: 30px;
    gap: 16px;
    margin: 8px 0;
    box-sizing: $box-shadow;

    &-title {
      font-size: 20px;
      font-weight: 500;
    }

    &-subtitle {
      color: $help-color;
      line-height: 1.5;
    }
  }
}

@media (max-width: 768px) {
  .intro {
    &__inner {
      max-width: 680px;
    }

    &__title {
      font-size: 24px;
    }

    &__subtitle {
      font-size: 16px;
    }
  }

  .install {
    &__inner {
      max-width: 680px;
    }

    &__items {
      flex-direction: column;
      align-items: center;
    }

    &__item {
      width: 80%;

      &-title {
        font-size: 18px;
      }

      &-subitems {
        font-size: 14px;
      }

      &-subitem {
        line-height: 1;
      }
    }
  }

  .advantages {
    &__inner {
      max-width: 680px;
    }

    &__items {
      flex-direction: column;

      .icon {
        font-size: 20px;
      }

      .advantages__item:nth-child(1),
      .advantages__item:nth-child(2),
      .advantages__item:nth-child(4),
      .advantages__item:nth-child(6) {
        width: 100%;
      }

      .advantages__item:nth-child(3),
      .advantages__item:nth-child(5) {
        width: 100%;
      }
    }

    &__item {
      &-title {
        font-size: 18px;
      }

      &-subtitle {
        line-height: 1;
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 480px) {
  .intro {
    &__inner {
      max-width: 480px;
      padding: 16px;
      flex-direction: column;
      gap: 16px;
    }

    &__title-container {
      width: 100%;
    }

    &__help-chat {
      width: 90%;
    }

    &__title {
      font-size: 20px;
    }

    &__subtitle {
      font-size: 14px;
    }
  }

  .install {
    &__inner {
      max-width: 100%;
      padding: 16px;
    }

    &__items {
      flex-direction: column;
      align-items: center;
    }

    &__item {
      width: 100%;

      &-title {
        font-size: 16px;
      }

      &-subitems {
        font-size: 12px;
      }

      &-subitem {
        line-height: 1.2;
      }
    }
  }

  .advantages {
    &__inner {
      max-width: 100%;
      padding: 16px;
    }

    &__items {
      flex-direction: column;

      .icon {
        font-size: 18px;
      }

      .advantages__item:nth-child(1),
      .advantages__item:nth-child(2),
      .advantages__item:nth-child(4),
      .advantages__item:nth-child(6) {
        width: 100%;
      }

      .advantages__item:nth-child(3),
      .advantages__item:nth-child(5) {
        width: 100%;
      }
    }

    &__item {
      padding: 16px;
      border-radius: 12px;
      &-title {
        font-size: 16px;
      }

      &-subtitle {
        line-height: 1.4;
        font-size: 12px;
      }
    }
  }
}

</style>
<!-- старый titleWrapper -->
<!-- <script setup lang="ts">
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
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;

  .title {
    font-size: 36px;
    text-align: center;
    line-height: 1.2;
    position: relative;

    &::after {
      content: '';
      display: block;
      width: 100px;
      height: 2px;
      background-color: $main-color;
      margin: 20px auto 0;
    }
  }

  .subtitle {
    font-size: 20px;
    font-weight: 300;
    color: $help-color;
  }
}

@media (max-width: 768px) {
  .title-wrapper {
    .title {
      font-size: 24px;
    }

    .subtitle {
      font-size: 16px;
    }
  }
}
</style> -->