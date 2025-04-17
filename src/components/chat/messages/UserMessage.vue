<template>
  <div class="message message--user">
    <div class="message__content">
      <div class="message__actions" v-if="isAuthenticated">
        <button class="action-button" @click="startEdit" title="Редактировать">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 2.5L13.5 4.5M10.5 13.5H14M2.5 10.5L10.5858 2.41421C11.3668 1.63316 12.6332 1.63317 13.4142 2.41421V2.41421C14.1953 3.19526 14.1953 4.46159 13.4142 5.24264L5.32843 13.3284C5.14317 13.5137 4.91678 13.6466 4.67082 13.7142L2.5 14L2.78579 11.8292C2.85337 11.5832 2.98632 11.3568 3.17157 11.1716L3.17157 11.1716Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <template v-if="isEditing">
        <textarea
          v-model="editedText"
          class="message__edit-input"
          ref="editInput"
        ></textarea>
        <div class="message__edit-actions">
          <button class="message__edit-button message__edit-button--cancel" @click="cancelEdit">
            Отменить
          </button>
          <button class="message__edit-button message__edit-button--apply" @click="saveEdit">
            Применить
          </button>
        </div>
      </template>
      <template v-else>
        <p class="message__text" v-html="formattedMessage"></p>
      </template>
      <span class="message__time">{{ formatTime(timestamp) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { formatTime } from '@/utils/date'
import { formattedText } from '@/utils/messageFormatter'
import { Modal } from 'ant-design-vue'
import { webSocketService, WebSocketAction } from '@/api/services/webSocketService'
import { useAssistentChatStore } from '@/stores/useAssistantChatStore'

const props = defineProps<{
  text: string
  timestamp: string
  isAuthenticated: boolean
  id: string
  messagesAfterCount: number
  workflowId: string
  sessionId: string
}>()

const emit = defineEmits<{
  (e: 'update:text', value: string): void
}>()

const chatStore = useAssistentChatStore()
const isEditing = ref(false)
const editedText = ref('')
const editInput = ref<HTMLTextAreaElement | null>(null)
const formattedMessage = ref('')

async function updateFormattedText() {
  formattedMessage.value = await formattedText(props.text)
}

watch(() => props.text, updateFormattedText, { immediate: true })

const startEdit = () => {
  editedText.value = props.text
  isEditing.value = true
  setTimeout(() => {
    editInput.value?.focus()
  })
}

const cancelEdit = () => {
  isEditing.value = false
  editedText.value = ''
}

const saveEdit = async () => {
  const trimmedText = editedText.value.trim()
  
  if (!trimmedText) {
    Modal.error({
      title: 'Ошибка',
      content: 'Сообщение не может быть пустым',
      okText: 'OK'
    })
    return
  }

  if (trimmedText !== props.text) {
    try {
      await Modal.confirm({
        title: 'Редактирование сообщения',
        content: `После редактирования этого сообщения будет удалено ${props.messagesAfterCount} последующих сообщений. Это действие нельзя отменить. Продолжить?`,
        okText: 'Применить',
        cancelText: 'Отмена',
        okType: 'primary',
        class: 'edit-confirmation-modal',
        okButtonProps: {
          type: 'primary',
          danger: false
        },
        cancelButtonProps: {
          type: 'primary',
          danger: true
        }
      })

      // Находим индекс редактируемого сообщения
      const messageIndex = chatStore.sessionMessages.findIndex(msg => msg.id === props.id)
      
      if (messageIndex !== -1) {
        // Выбираем все сообщения начиная с редактируемого
        const messagesToDelete = chatStore.sessionMessages.slice(messageIndex)
        
        // Отправляем WebSocket сообщение
        await webSocketService.send({
          action: WebSocketAction.EditMessage,
          workflowId: props.workflowId,
          roomId: props.sessionId,
          message: trimmedText,
          editMessageId: props.id,
          messageIdsToDelete: messagesToDelete.map(msg => msg.id)
        })

        // Обновляем текст сообщения локально
        emit('update:text', trimmedText)
        
        // Перезагружаем сообщения
        await chatStore.loadDialogMessages(props.workflowId, props.sessionId)
      }
    } catch {
      // Пользователь отменил сохранение
    }
  }
  
  isEditing.value = false
}
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  max-width: 80%;
  width: 100%;
  align-self: flex-end;

  &__content {
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
    word-wrap: break-word;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    width: 100%;
    box-sizing: border-box;
    background-color: #ebf5ff;
    color: #000000;
    border-bottom-right-radius: 4px;
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

  &:hover {
    .message__actions {
      opacity: 1;
    }
  }

  &__text {
    margin: 0;
    font-size: 15px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;

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

    :deep(.inline-code) {
      background-color: #f8f9fa;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }
  }

  &__time {
    font-size: 10px;
    color: rgba(#000000, 0.45);
    position: absolute;
    bottom: 4px;
    right: 8px;
  }

  &__edit-input {
    width: 100%;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid rgba(#000000, 0.1);
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
    box-sizing: border-box;
    margin: 0;
    background-color: #ffffff;
    color: #000000;
    margin-bottom: 8px;

    &:focus {
      outline: none;
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }

  &__edit-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  &__edit-button {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;

    &--cancel {
      background-color: #ff4d4f;
      color: #ffffff;

      &:hover {
        background-color: #ff7875;
      }
    }

    &--apply {
      background-color: #52c41a;
      color: #ffffff;

      &:hover {
        background-color: #73d13d;
      }
    }
  }
}

.action-button {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.5);
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

  svg {
    width: 16px;
    height: 16px;
  }
}
</style>

<style lang="scss">
// Глобальные стили для модального окна
.edit-confirmation-modal {
  .ant-btn-primary:not(.ant-btn-dangerous) {
    background-color: #52c41a;
    border-color: #52c41a;

    &:hover {
      background-color: #73d13d;
      border-color: #73d13d;
    }
  }
}
</style> 