<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { IMessageList } from '@/stores/useQuestionsStore';
import { computed } from 'vue';
import { RouteNames } from '@/router/routes/routeNames';

const props = defineProps({
  message: {
    type: Object as () => IMessageList,
    required: true,
  },
});

const { message } = props;
const router = useRouter();

const cardClass = computed(() => {
  if (!message) return '';
  return message.isAnswered ? 'questions-card--answered' : 'questions-card--unanswered';
});

const statusClass = computed(() => {
  if (!message) return '';
  return message.isAnswered ? 'questions-card__footer-status--answered' : 'questions-card__footer-status--unanswered';
});

const statusText = computed(() => {
  if (!message) return '';
  return message.isAnswered ? 'Отвечено' : 'Не отвечено';
});

const goToNavigateDetails  = () => {
  router.push({ name: RouteNames.QUESTION_DETAIL, params: { id: message.id } });
};
</script>

<template>
  <div :class="['questions-card', cardClass]" @click="goToNavigateDetails">
    <div class="questions-card__container">
      <img :src="message.image" class="questions-card__image" />
      <h4 class="questions-card__name">{{ message.name }}</h4>
    </div>
    <p class="questions-card__last-message">{{ message.lastMessage }}</p>
    <div class="questions-card__footer">
      <p class="questions-card__date">{{ new Date(message.dateLastMessage).toLocaleDateString() }}</p>
      <div :class="['questions-card__footer-status', statusClass]">
        {{ statusText }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.questions-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: $light-color;
  border: 1px solid $light-grey-color;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: $box-shadow-large;
  }

  &--answered {
    background-color: rgba($success-color, 0.05);
  }

  &--unanswered {
    background-color: rgba($danger-color, 0.05);
  }

  &__container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  &__name {
    font-size: 16px;
    font-weight: 500;
  }

  &__last-message {
    font-size: 16px;
    color: $help-color;
  }

  &__date {
    font-size: 12px;
    color: $help-color;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__footer-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    &--answered {
      background-color: rgba($success-color, 20%);
      color: $success-color;
    }

    &--unanswered {
      background-color: rgba($danger-color, 20%);
      color: $danger-color;
    }
  }
}
</style>