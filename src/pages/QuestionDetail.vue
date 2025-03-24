<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useQuestionsStore } from '@/stores/useQuestionsStore';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import { ref, computed } from 'vue';
import TextAreaField from '@/components/ui/TextAreaField.vue';
import Button from '@/components/ui/Button.vue';

const route = useRoute();
const questionsStore = useQuestionsStore();

const isHistoryCollapsed = ref<boolean>(true);
const toggleHistory = () => {
  isHistoryCollapsed.value = !isHistoryCollapsed.value;
};

const messageId = computed(() => route.params.id as string);
const messageDetail = computed(() => questionsStore.getMessageDetailWithName(messageId.value));
const message = ref('');//изменяем на ref для обновления значения
</script>

<template>
  <div class="dialog-page">
    <div class="dialog-page__main">
      <TitleWrapper 
        title="Диалог"
        subtitle="Как улучшить точность моих ответов на технические вопросы?"
      />
      <div class="dialog-page__container" v-if="messageDetail">
        <div 
          class="dialog-page__history"
          :class="{ 'dialog-page__history--collapsed': isHistoryCollapsed }"
        >
          <div 
            class="dialog-page__history-header"
            @click="toggleHistory"
          >
            <div class="dialog-page__history-title">
              История диалога
              <span class="dialog-page__history-arrow">↓</span>
            </div>
          </div>
          <div class="dialog-page__history-date">
            {{ new Date(messageDetail.messages[0].timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </div>
          <div class="dialog-page__history-messages">
            <div 
              v-for="msg in messageDetail.messages" 
              :key="msg.id"
              class="dialog-page__history-message"
              :class="{ 'dialog-page__history-message--assistant': msg.sender === 'assistant' }"
            >
              <div class="dialog-page__history-message-author">
                {{ msg.sender === 'assistant' ? `Ассистент ${messageDetail.assistantName}` : 'Пользователь' }}
              </div>
              <div class="dialog-page__history-message-text">{{ msg.text }}</div>
              <div class="dialog-page__history-message-time">
                {{ new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
              </div>
            </div>
          </div>
        </div>

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

  &__history {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: $light-blue-color;
    border-radius: 12px;
    transition: all 0.3s ease;

    &--collapsed {
      .dialog-page__history-messages,
      .dialog-page__history-date {
        display: none;
      }

      .dialog-page__history-arrow {
        transform: rotate(-90deg);
      }
    }
  }

  &__history-header {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  &__history-title {
    font-size: 24px;
    font-weight: 600;
    color: $dark-secondary-color;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__history-arrow {
    font-size: 20px;
    transition: transform 0.3s ease;
  }

  &__history-date {
    font-size: 16px;
    color: $help-color;
    padding-bottom: 16px;
    border-bottom: 1px solid $light-grey-color;
  }

  &__history-messages {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__history-message {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    background: $light-color;
    border-radius: 12px;
    width: 50%;
    align-self: flex-end;

    &--assistant {
      align-self: flex-start;
      background: rgba($help-color, 0.1);
    }
  }

  &__history-message-author {
    font-size: 14px;
    font-weight: 600;
    color: $help-color;
  }

  &__history-message-text {
    font-size: 16px;
    line-height: 1.6;
    color: #374151;
    white-space: pre-wrap;
  }

  &__history-message-time {
    font-size: 12px;
    color: #9CA3AF;
    align-self: flex-end;
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