<template>
  <div class="chat-form">
    <div class="form-container">
      <div class="chat-header" v-if="showHeader">
        <div class="logo">
          <span class="logo-text">Red<span>Ai</span>st</span>
        </div>
        <div class="path-container">
          Сайт → aiОпросер → Sheets
        </div>
        <button class="info-button" v-if="showInfo">ⓘ</button>
      </div>
      <div class="message-container">
        <textarea
          ref="messageInput"
          v-model="message"
          placeholder="Сообщение"
          @keydown.enter.prevent="handleSend"
          @input="autoGrow"
          :disabled="isLoading"
          rows="1"
          class="chat-input"
        ></textarea>
        <button class="enter-button" :disabled="!message.trim() || isLoading" @click="handleSend">
          Enter
        </button>
      </div>
      <div class="chat-actions">
        <div class="mode-buttons">
          <button v-if="showAgents"
            v-for="mode in modes" 
            :key="mode.id"
            class="mode-button"
            :class="{ 'mode-button--active': currentMode === mode.id }"
            @click="$emit('update:current-mode', mode.id)"
          >
            <span class="mode-icon">{{ mode.icon }}</span>
            {{ mode.name }}
            <span class="mode-shortcut" v-if="mode.shortcut">{{ mode.shortcut }}</span>
          </button>
        </div>
        <div class="action-buttons">
          <button v-if="showTools" class="tools-button" @click="$emit('tools-click')">
            <span class="tools-icon">🔧</span>
            Tools
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isLoading: boolean
  modes: Array<{
    id: string
    name: string
    icon: string
    shortcut?: string
    model?: string
  }>
  currentMode: string
  model: string
  path?: string
  showHeader?: boolean
  showInfo?: boolean
  showTools?: boolean
  showAgents?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'update:current-mode', mode: string): void
  (e: 'tools-click'): void
  (e: 'agents-click'): void
  (e: 'ask-click'): void
}>()

const message = ref('')
const messageInput = ref<HTMLTextAreaElement | null>(null)

const autoGrow = () => {
  if (!messageInput.value) return
  messageInput.value.style.height = '24px'
  const newHeight = Math.min(messageInput.value.scrollHeight, 150)
  messageInput.value.style.height = `${newHeight}px`
}

const handleSend = () => {
  if (!message.value.trim() || props.isLoading) return
  emit('send', message.value)
  message.value = ''
  if (messageInput.value) {
    messageInput.value.style.height = '24px'
  }
}
</script>

<style lang="scss" scoped>
.chat-form {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 800px;
  padding: 20px;
  box-sizing: border-box;
  margin: 0 auto;
  z-index: 0;
}

.form-container {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 16px;
  border: 5px solid #F0F2F5;
  width: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 8px;
}

.logo-text {
  font-family: sans-serif;
  font-weight: 800;
  letter-spacing: 1px;
  color: #FF6B4A;
  
  span {
    color: #03c9a8;
  }
}

.path-container {
  color: #666;
  font-size: 14px;
}

.info-button {
  background: none;
  border: none;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  
  &:hover {
    color: rgba(0, 0, 0, 0.8);
  }
}

.message-container {
  background: #F6F7FB;
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #1A1E23;
  font-size: 16px;
  outline: none;
  min-height: 24px;
  max-height: 150px;
  resize: none;
  padding: 0;
  padding-right: 90px;
  
  &::placeholder {
    color: #6B7280;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c0c0c0;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.enter-button {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  background: #FF6B4A;
  border: none;
  color: white;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &:hover:not(:disabled) {
    background: #E55A3D;
  }

  &:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
  }
}

.chat-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mode-buttons {
  display: flex;
  gap: 8px;
}

.mode-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: none;
  border: none;
  color: #6B7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &--active {
    background: #2f3542;
    color: white;
  }

  .mode-icon {
    font-size: 14px;
  }

  .mode-shortcut {
    font-size: 11px;
    color: #999;
    margin-left: 4px;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.tools-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: none;
  border: none;
  color: #6B7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .tools-icon {
    font-size: 14px;
  }
}
</style> 