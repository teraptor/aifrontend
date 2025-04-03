<template>
  <div v-if="isOpen" class="share-modal" @click.self="close">
    <div class="share-modal__content">
      <div class="share-modal__header">
        <h3>Поделиться ассистентом</h3>
        <button class="share-modal__close" @click="close">×</button>
      </div>
      <div class="share-modal__body">
        <div class="share-modal__link-container">
          <input 
            type="text" 
            :value="assistantLink" 
            readonly 
            class="share-modal__link-input"
            ref="linkInput"
          >
          <button class="share-modal__copy-button" @click="copyLink">
            Копировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { notifications } from '@/plugins/notifications'

const props = defineProps<{
  isOpen: boolean
  assistantName?: string
  assistantDescription?: string
  assistantId?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const linkInput = ref<HTMLInputElement | null>(null)

const assistantLink = computed(() => {
  return `${window.location.origin}/chat/${props.assistantId || ''}`
})

const close = () => {
  emit('close')
}

const copyLink = async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(assistantLink.value)
    } else {
      // Запасной вариант для браузеров без поддержки Clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = assistantLink.value
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
    }
    notifications.success('Ссылка скопирована')
    close()
  } catch (error) {
    console.error('Ошибка при копировании ссылки:', error)
    notifications.error('Не удалось скопировать ссылку')
  }
}

const shareViaWebShare = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: props.assistantName || 'Ассистент',
        text: props.assistantDescription || '',
        url: assistantLink.value
      })
    }
  } catch (error) {
    console.error('Ошибка при попытке поделиться:', error)
  }
}

// Автоматически выделяем текст при открытии модального окна
nextTick(() => {
  if (props.isOpen && linkInput.value) {
    linkInput.value.select()
  }
})
</script>

<style lang="scss" scoped>
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &__content {
    background: #ffffff;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  &__header {
    padding: 16px;
    border-bottom: 1px solid rgba(#999, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  &__close {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0 8px;
    line-height: 1;

    &:hover {
      color: #666;
    }
  }

  &__body {
    padding: 16px;
  }

  &__link-container {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__link-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid rgba(#999, 0.2);
    border-radius: 6px;
    font-size: 14px;
    color: #333;
    background: #f5f5f5;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }
  }

  &__copy-button {
    padding: 8px 16px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;

    &:hover {
      background: #40a9ff;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__action-button {
    flex: 1;
    padding: 8px 16px;
    background: rgba(24, 144, 255, 0.1);
    color: #1890ff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color 0.2s;

    &:hover {
      background: rgba(24, 144, 255, 0.15);
    }
  }

  &__action-icon {
    font-size: 16px;
  }
}
</style> 