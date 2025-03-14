<template>
  <div class="assistent">
    <div class="assistent__header-wrapper">
      <div class="assistent__header-back" @click="goBack">
        <span class="icon icon-arrow-left2" />
        Назад
      </div>
      <TitleWrapper title="Параметры ассистента" />
    </div>
    <div class="assistent-detail" v-if="assistent">
      <div class="assistent-detail__container">
        <img :src="assistent.image" class="assistent-detail__image"/>
        <div class="assistent-detail__name-wrapper">
          <h4 class="assistent-detail__name"> {{ assistent.name }}</h4>
          <p class="assistent-detail__summary"> {{ assistent.summary }}</p>
        </div>
        <button class="assistent-detail__start-button">
          Попробовать
          <span class="assistent-detail__start-icon">➔</span>
        </button>
      </div>
      
      <div class="assistent-detail__tabs">
        <div 
          class="assistent-detail__tab assistent-detail__tab--active"
        >
          Описание
        </div>
      </div>
      
      <div class="assistent-detail__content">
        <h2 class="assistent-detail__content-title">Пример работы ассистента</h2>
        <p class="assistent-detail__content-text">Автор не предоставил пример работы @{{ assistent.id }}</p>
        
        <h2 class="assistent-detail__content-title">Описание</h2>
        <p class="assistent-detail__content-text">{{ assistent.description }}</p>
        
        <p class="assistent-detail__content-text">Ассистент пишет тексты с учетом SEO-оптимизации.</p>
        
        <p class="assistent-detail__content-text">Необходимо предоставить ему следующую информацию:</p>
        
        <p class="assistent-detail__content-text">Укажите, о чем должен быть текст. И чат придумает тему / заголовок статьи.</p>
        
        <p class="assistent-detail__content-text">Целевые ключевые слова: Предоставьте список ключевых слов и фраз, которые необходимо включить в текст. Укажите основное ключевое слово для оптимизации, а также второстепенные и вспомогательные ключевые слова.</p>
        
        <p class="assistent-detail__content-text">Статистику по словам можно взять тут https://wordstat.yandex.ru/</p>
        
        <p class="assistent-detail__content-text">Тон и стиль: Укажите, какой тон и стиль письма вы предпочитаете (например, формальный, неформальный, убедительный, информативный).</p>
        
        <p class="assistent-detail__content-text">Структура статьи: опишите, как должна быть организована статья, включая предпочтительное количество и виды разделов (например, введение, основная часть, подразделы, заключение).</p>
        
        <p class="assistent-detail__content-text">Аудитория: Опишите целевую аудиторию, для которой предназначен контент (например, возраст, интересы, уровень знаний по теме).</p>
        
        <p class="assistent-detail__content-text">Специфические инструкции: Если есть определенные темы или пункты, которые обязательно должны быть освещены в тексте, озвучьте это.</p>
        
        <p class="assistent-detail__content-text">Ограничения или запреты: Укажите, какую информацию избегать или какие ошибки недопустимы при создании контента.</p>
        
        <p class="assistent-detail__content-text">Предоставив всю необходимую информацию и инструкции, вы сможете значительно повысить шансы на получение качественного SEO-оптимизированного контента от ассистента.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';

const assistentsStore = useAssistentsStore();
const router = useRouter();
const route = useRoute();

const assistent = computed(() => assistentsStore.getAssistentById(route.params.id as string)!);

const goBack = (): void => router.back();
</script>

<style lang="scss" scoped>
.assistent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  width: 100%;

  &__header-wrapper {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__header-back {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 4px;
    color: $help-color;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      color: $dark-secondary-color;
    }
  }
}

.assistent-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 48rem;
  gap: 16px;

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  &__image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
  }

  &__name-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__name {
    font-weight: 600;
    font-size: 20px;
  }

  &__summary {
    color: $help-color;
    font-size: 14px;
  }
  
  &__start-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: #e6f4f1;
    color: #0c8599;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #d0ebea;
    }
    
    &-icon {
      font-size: 18px;
      color: #0c8599;
    }
  }
  
  &__tabs {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid #e5e5e5;
    width: 100%;
    margin-top: 16px;
  }
  
  &__tab {
    padding: 8px 16px;
    cursor: pointer;
    font-weight: 500;
    color: $help-color;
    border-radius: 8px 8px 0 0;
    
    &--active {
      color: $primary-color;
      background-color: #f5f5f5;
      font-weight: 600;
    }
  }
  
  &__content {
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    &-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    &-text {
      color: $help-color;
      line-height: 1.5;
      margin-bottom: 16px;
    }
  }
}
</style>