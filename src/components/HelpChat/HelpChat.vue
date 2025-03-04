<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useHelpChatStore } from '@/stores/useHelpChatStore'
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import Button from '@/components/ui/Button.vue'
import InputField from '@/components/ui/InputField.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

const props = defineProps({
  width: {
    type: String,
    default: '80%',
  },
  height: {
    type: String,
    default: '70vh',
  },
})

const messagesContainer = ref<HTMLElement | null>(null)

const helpChatStore = useHelpChatStore()
const { messages, newMessage } = storeToRefs(helpChatStore)

const sendMessage = () => {
  if (!helpChatStore.isWebSocketClosed) helpChatStore.sendMessage()
}

const sendSuggestionMessage = (suggestionText: string) => {
  newMessage.value = suggestionText
  sendMessage()
}

const formattedText = (text: string) => text.replace(/\n/g, '<br />')

const newChat = () => {
  messages.value.splice(0, messages.value.length, {
    text: `Добрый день! Чем могу помочь?`,
    sender: 'Поддержка',
    createdAt: new Date().toISOString(),
  })
  helpChatStore.connectWebSocket()
}

onMounted(() => {
  helpChatStore.connectWebSocket()
})

onBeforeUnmount(() => {
  helpChatStore.closeWebSocket()
})

watch(messages.value, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})
</script>
<template>
  <div class="help">
    <div class="help__chat" :style="{ width: props.width, height: props.height }">
      <h2 class="help__chat-title">Попробуй OmniBot</h2>
      <div class="help__chat-messages" ref="messagesContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="{
            'message--right': message.sender === 'Вы',
            'message--left': message.sender !== 'Вы',
          }"
        >
          <p class="message__sender">{{ message.sender }}:</p>
          <p class="message__text" v-html="formattedText(message.text)"></p>
          <p class="message__time">
            {{ helpChatStore.formatDate(message.createdAt) }}
          </p>
        </div>
        <div class="help__chat-typing" v-if="helpChatStore.isTyping">
          Печатает сообщение
        </div>
        <div
          class="message__suggestions"   
          v-if="
            helpChatStore.areSuggestionsLoaded &&
            helpChatStore.suggestions.length > 0
          "       
        >
          <swiper
            class="message__suggestions-items"
            :slides-per-view="2"
            :space-between="20"
            :navigation="true"
            :modules="[Navigation]"
          >
      <swiper-slide
        class="message__suggestions-item"
        v-for="(suggestion, index) in helpChatStore.suggestions"
        :key="index"
        @click="sendSuggestionMessage(suggestion.answer)"
      >
        <p class="message__suggestions-item-answer">
          {{ suggestion.answer }}
        </p>
      </swiper-slide>
    </swiper>
        </div>
      </div>
      <div class="help__chat-button-group">
        <InputField
          v-model="newMessage"
          placeholder="Напишите сообщение ..."
          size="large"
          @keyup.enter="sendMessage"
        />
        <Button
          v-if="helpChatStore.isWebSocketClosed"
          button-type="primary"
          text="Новый чат"
          @click="newChat"
          type="button"
          size="large"
        />
        <Button
          v-else
          button-type="success"
          text="Отправить"
          @click="sendMessage"
          type="button"
          size="large"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.help {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &__chat {
    display: flex;
    flex-direction: column;
    border: 2px solid $border-light;
    padding: 24px;
    background-color: $light-color;
    border-radius: 30px;
    gap: 16px;
    margin: 8px 0;
    position: relative;

    &-title {
      font-size: 20px;
      font-weight: 600;
      text-align: center;
    }

    &-messages {
      overflow-y: auto;
      flex-grow: 1;
      padding: 20px;
      background: rgba(249, 250, 251, 1);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 8px;

      &::-webkit-scrollbar {
        width: 5px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: $main-color;
      }

      &::-webkit-scrollbar-track {
        margin: 10px 0;
        background-color: $light-grey-color;
      }
    }

    .message {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 20%;
      max-width: 40%;
      width: auto;
      word-wrap: break-word;
      background-color: $light-color;
      padding: 12px;
      border-radius: 10px;

      &--left {
        background-color: rgba($success-color, 0.2);
        align-self: flex-start;
      }

      &--right {
        background-color: rgba($main-color, 0.2);
        align-self: flex-end;
      }

      &__sender {
        font-weight: 500;
      }

      &__text {
        font-weight: 300;
      }

      &__time {
        text-align: right;
        font-weight: 300;
        font-size: 10px;
        color: $help-color;
      }

      &__suggestions {
        margin-top: auto;
        padding: 10px;
        width: 100%;
        height: 40px;
        text-align: center;

        &-items {
          width: 100%;
          height: 40px;
        }

        &-item {
          height: 40px;
          font-size: 14px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: $light-color;
          border-radius: 10px;
          cursor: pointer;
          border: 2px solid rgba($help-color, 0.2);

          &-answer {
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            white-space: normal;
            box-sizing: border-box;
            max-width: 80%;
          }
        }
      }
    }

    &-typing {
      display: flex;
      align-items: center;
      font-weight: 300;
      color: $help-color;
      gap: 4px;

      &::after {
        content: ' .';
        display: inline-block;
        animation: typing-dots 1s infinite steps(3);
      }
    }

    @keyframes typing-dots {
      0% {
        content: ' ';
      }
      30% {
        content: ' .';
      }
      60% {
        content: ' ..';
      }
      100% {
        content: ' ...';
      }
    }

    &-button-group {
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

  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) {
    color: $main-color;
    background-color: $light-color;
    border: 2px solid $main-color;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    transform: translateY(40%);

    &::after {
      font-size: 14px;
      font-weight: 900;
    }
  }
}

@media (max-width: 768px) {
  .help {
    &__chat {
      padding: 16px;

      &-title {
        font-size: 18px;
      }

      .message {
        padding: 8px;
        font-size: 12px;
        max-width: 60%;

        &__time {
          font-size: 8px;
        }
      }
    }
  }
}
</style>