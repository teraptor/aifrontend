<template>
  <div class="message message--assistant">
    <div class="message__content">
      <template v-if="isEditing">
        <textarea
          v-model="editedText"
          class="message__edit-input"
          @blur="saveEdit"
          @keydown.enter.prevent="saveEdit"
          @keydown.esc.prevent="cancelEdit"
          ref="editInput"
        ></textarea>
      </template>
      <template v-else>
        <p class="message__text" v-html="formattedText(text)"></p>
      </template>
      <span class="message__time">{{ formatTime(timestamp) }}</span>
    </div>
    <div class="message__actions">
      <i class="fas fa-pencil-alt" @click="startEdit"></i>
      <i class="fas fa-trash-alt"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatTime } from '@/utils/date'
import { formattedText } from '@/utils/messageFormatter'
import { Modal } from 'ant-design-vue'

const props = defineProps<{
  text: string
  timestamp: string
}>()

const emit = defineEmits<{
  (e: 'update:text', value: string): void
}>()

const isEditing = ref(false)
const editedText = ref('')
const editInput = ref<HTMLTextAreaElement | null>(null)

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
        title: 'Подтверждение',
        content: 'Вся история диалога будет изменена и начата с этого места',
        okText: 'Сохранить',
        cancelText: 'Отмена',
        okType: 'warning'
      })
      emit('update:text', trimmedText)
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
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    padding-top: 8px;

    i {
      font-size: 14px;
      color: #999;
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #1890ff;
      }
    }
  }

  &:hover {
    .message__actions {
      opacity: 1;
    }
  }

  &__text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    color: #333333;

    &:empty {
      display: none;
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

  &__edit-input {
    width: 100%;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
    box-sizing: border-box;
    margin: 0;

    &:focus {
      outline: none;
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
}
</style> 