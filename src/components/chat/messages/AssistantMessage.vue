<template>
  <div class="message message--assistant">
    <div class="message__content">
      <div class="message__actions">
        <button class="action-button" @click="copyText" title="Копировать">
          <i class="fas fa-copy"></i>
        </button>
      </div>
      <p class="message__text" v-html="formattedMessage"></p>
      <span class="message__time">{{ formatTime(props.timestamp) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { formatTime } from '@/utils/date'
import { formattedText } from '@/utils/messageFormatter'
import { notifications } from '@/plugins/notifications'
import '@fortawesome/fontawesome-free/css/all.css'

const props = defineProps<{
  text: string
  timestamp: string
  isAuthenticated: boolean
}>()

const formattedMessage = ref('')

async function updateFormattedText() {
  formattedMessage.value = await formattedText(props.text)
}

watch(() => props.text, updateFormattedText, { immediate: true })

const copyText = () => {
  navigator.clipboard.writeText(props.text)
    .then(() => {
      notifications.success('Текст скопирован в буфер обмена');
    })
    .catch(() => {
      notifications.error('Не удалось скопировать текст');
    });
}

const regenerateResponse = () => {
  // Implementation of regenerateResponse function
}
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  max-width: 80%;
  width: 100%;
  align-self: flex-start;
  gap: 8px;

  &__content {
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
    word-wrap: break-word;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    width: 100%;
    box-sizing: border-box;
    background-color: #f5f7fa;
    border-bottom-left-radius: 4px;
    min-height: 44px;
  }

  &__actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1;
  }

  &__content:hover .message__actions {
    opacity: 1;
  }

  &__text {
    margin: 0;
    padding-right: 40px;
    font-size: 15px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    color: #333333;

    &:empty {
      display: none;
    }

    :deep(h1) {
      font-size: 1.5em;
      margin: 0.5em 0;
    }

    :deep(h2) {
      font-size: 1.3em;
      margin: 0.4em 0;
    }

    :deep(h3) {
      font-size: 1.1em;
      margin: 0.3em 0;
    }

    :deep(ul) {
      margin: 0.5em 0;
      padding-left: 1.5em;
    }

    :deep(li) {
      margin: 0.2em 0;
    }

    :deep(strong) {
      font-weight: 600;
    }

    :deep(em) {
      font-style: italic;
    }

    :deep(a) {
      color: #1890ff;
      text-decoration: underline;
      word-break: break-word;

      &:hover {
        text-decoration: none;
      }
    }

    :deep(.code-block) {
      background-color: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
      font-family: monospace;
    }

    :deep(.mermaid-diagram) {
      margin: 16px 0;
      text-align: center;
    }

    :deep(.math-block) {
      margin: 16px 0;
      text-align: center;
    }

    :deep(.math-inline) {
      font-size: 1.1em;
    }

    :deep(.inline-code) {
      background-color: #f8f9fa;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }

    :deep(.table-row) {
      display: flex;
      margin: 4px 0;
    }

    :deep(.table-cell) {
      flex: 1;
      padding: 4px;
      border: 1px solid #e8e8e8;
    }
  }

  &__time {
    font-size: 10px;
    color: #999;
    position: absolute;
    bottom: 4px;
    right: 8px;
  }
}

.action-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.1);
  }

  i {
    font-size: 14px;
  }
}
</style> 