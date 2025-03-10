<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useQuestionsStore } from '@/stores/useQuestionsStore';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import { computed } from 'vue';
import InputField from '@/components/ui/InputField.vue';
import Button from '@/components/ui/Button.vue';

const route = useRoute();
const questionsStore = useQuestionsStore();

const messageId = computed(() => route.params.id as string);
const messageDetail = computed(() => questionsStore.getMessageDetailWithName(messageId.value));
</script>

<template>
  <div class="question-detail">
    <TitleWrapper title="Диалог" subtitle="Как улучшить точность моих ответов на технические вопросы?" />
    <div class="question-detail__messages" v-if="messageDetail">
      <div v-for="msg in messageDetail.messages" :key="msg.id" :class="['question-detail__message', msg.sender]">
        <div v-if="msg.sender === 'assistant'" class="question-detail__message-sender">
        {{ messageDetail.assistantName }}
        </div>
        <p class="question-detail__message-text">{{ msg.text }}</p>
        <span class="message-date">{{ new Date(msg.timestamp).toLocaleString() }}</span>
      </div>
    </div>
    <div class="question-detail__btn-group">
      <InputField 
        size="large"
        placeholder="Написать ассистенту"
      />
      <Button
        button-type="success"
        text="Введите сообщение"
        size="large"
        type="button"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.question-detail {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 30px;

  &__messages {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  &__message {
    max-width: 50%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;

    &.user {
      align-self: flex-end;
      background: rgba($success-color, 40%);
      color: $light-color;
      border-radius: 12px;

      .message-date {
        font-size: 12px;
      } 
    }

    &.assistant {
      align-self: flex-start;
      background: $light-grey-color;
      border-radius: 12px;

      .message-date {
        font-size: 12px;
        color: $help-color;
      }
    }

    &-sender {
      font-size: 14px;
      font-weight: 500;
      color: $help-color;
    }

    &-text {
      line-height: 1.5
    }
  }

  &__assistent-name {
    font-size: 18px;
    font-weight: 500;
  }

  &__btn-group {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      width: 100%;
      margin-top: auto;

      & > *:first-child {
        flex-basis: 70%;
      }

      & > *:nth-child(2) {
        flex-basis: 30%;
      }
    }
}
</style>