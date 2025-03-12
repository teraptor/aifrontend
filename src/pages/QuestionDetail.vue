<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useQuestionsStore } from '@/stores/useQuestionsStore';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import { computed } from 'vue';
import TextAreaField from '@/components/ui/TextAreaField.vue';
import Button from '@/components/ui/Button.vue';

const route = useRoute();
const questionsStore = useQuestionsStore();

const messageId = computed(() => route.params.id as string);
const messageDetail = computed(() => questionsStore.getMessageDetailWithName(messageId.value));
const message =''//для компонента textArea
</script>

<template>
  <div class="dialog-page">
    <div class="dialog-page__main">
      <TitleWrapper 
        title="Диалог"
        subtitle="Как улучшить точность моих ответов на технические вопросы?"
      />
      <div class="dialog-page__container" v-if="messageDetail">
        <div class="dialog-page__messages">
          <div 
            v-for="msg in messageDetail.messages" 
            :key="msg.id"
            class="dialog-page__message"
            :class="{
              'dialog-page__message--assistant': msg.sender === 'assistant',
              'dialog-page__message--user': msg.sender === 'user'
            }"
          >
            <img 
              :src="messageDetail.assistanImage"  
              class="dialog-page__avatar" 
              v-if="msg.sender === 'assistant'"
            />
            <div class="dialog-page__content">
              <div class="dialog-page__name" v-if="msg.sender === 'assistant'">
                Ассистент {{ messageDetail.assistantName }}
              </div>
              <div class="dialog-page__text">{{ msg.text }}</div>
              <div class="dialog-page__date">
                {{ new Date(msg.timestamp).toLocaleString('ru-RU') }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="dialog-page__form">
          <div class="dialog-page__assistant-info">
            <img 
              :src="messageDetail.assistanImage" 
              class="dialog-page__avatar"
            />
            <div class="dialog-page__assistant-name">{{ messageDetail.assistantName }}</div>
          </div>
          
          <div class="dialog-page__input-group">
            <TextAreaField
              placeholder="Введите текст..."
              size="message"
              v-model="message"
            />
            <Button
              button-type="light-danger"
              text="Отправить"
              size="message"
              type="button"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dialog-page {
  width: 100%;
  min-height: 100vh;
  display: flex;

  &__main {
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 100vh;
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    border-radius: 12px;
    padding-bottom: 120px;
    position: relative;
  }

  &__messages {
    padding: 20px;
    padding-bottom: 120px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__message {
    display: flex;
    gap: 12px;
    width: 50%;

    &--assistant {
      align-self: flex-start;
    }

    &--user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    background: rgba($light-blue-color, 0.8);
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
    box-shadow: $box-shadow-small;
    backdrop-filter: blur(8px);
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: $help-color;
    margin-bottom: 4px;
  }

  &__text {
    margin-bottom: 4px;
    line-height: 1.5;
  }

  &__date {
    font-size: 12px;
    color: $help-color;
  }

  &__message--user &__content {
    background: rgba($light-danger-color, 0.8);
    color: $light-color;
    box-shadow: 0 1px 2px rgba($light-danger-color, 0.2);
    backdrop-filter: blur(8px);
  }

  &__message--user &__date {
    color: rgba($light-color, 0.8);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;
  }

  &__assistant-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
  }

  &__assistant-name {
    font-size: 18px;
    font-weight: 600;
    color: $dark-secondary-color;
  }

  &__input-group {
    padding: 8px;
    display: flex;
    gap: 12px;

    & > *:first-child {
      flex-basis: 70%;
    }

    & > *:nth-child(2) {
      flex-basis: 30%;
    }
  }
}
</style>