<template>
  <div class="message message--user">
    <div class="message__content">
      <div class="message__actions">
        <i class="fas fa-pencil-alt" @click="startEdit"></i>
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
        title: 'Подтверждение',
        content: 'Вся история диалога будет изменена и начата с этого места',
        okText: 'Сохранить',
        cancelText: 'Отмена',
        okType: 'primary'
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
    opacity: 0;
    transition: opacity 0.2s ease;

    i {
      font-size: 14px;
      color: rgba(#ffffff, 0.8);
      cursor: pointer;
      transition: color 0.2s ease;

      &:hover {
        color: #ffffff;
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
    color: rgba(#ffffff, 0.8);
    position: absolute;
    bottom: 4px;
    right: 8px;
  }

  &__edit-input {
    width: 100%;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid rgba(#ffffff, 0.3);
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    font-family: inherit;
    box-sizing: border-box;
    margin: 0;
    background-color: rgba(#ffffff, 0.1);
    color: #ffffff;
    margin-bottom: 8px;

    &:focus {
      outline: none;
      border-color: #ffffff;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
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
      background-color: rgba(#ffffff, 0.1);
      color: #ffffff;

      &:hover {
        background-color: rgba(#ffffff, 0.2);
      }
    }

    &--apply {
      background-color: #ffffff;
      color: #1890ff;

      &:hover {
        background-color: rgba(#ffffff, 0.9);
      }
    }
  }
}
</style> 