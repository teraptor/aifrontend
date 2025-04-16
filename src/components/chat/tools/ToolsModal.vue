<template>
  <div v-if="isOpen" class="tools-modal" @click.self="close">
    <div class="tools-modal__content">
      <div class="tools-modal__header">
        <h3>Инструменты</h3>
        <button class="tools-modal__close" @click="close">×</button>
      </div>
      <div class="tools-modal__body">
        <!-- Загрузка -->
        <div v-if="loading" class="tools-modal__loading">
          <div class="loader"></div>
          <p>Загрузка инструментов...</p>
        </div>
        
        <!-- Ошибка -->
        <div v-else-if="error" class="tools-modal__error">
          <p>Произошла ошибка при загрузке инструментов</p>
          <button class="tools-modal__retry" @click="loadTools">Повторить</button>
        </div>
        
        <!-- Пусто -->
        <div v-else-if="tools.length === 0" class="tools-modal__empty">
          <p>Нет доступных инструментов</p>
        </div>
        
        <!-- Список инструментов -->
        <div v-else class="tools-grid">
          <div v-for="tool in tools" :key="tool.id" class="tools-grid__item">
            <div class="tools-grid__icon">{{ tool.icon }}</div>
            <div class="tools-grid__label">{{ tool.name }}</div>
            <div class="tools-grid__description">{{ tool.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAssistentsStore } from '@/stores/useAssistantsStore'
import type { Tool } from '@/api/types'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const assistentsStore = useAssistentsStore()
const tools = ref<Tool[]>([])
const loading = ref(false)
const error = ref(false)

const loadTools = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response = await assistentsStore.getToolsList()
    tools.value = response?.tools || []
  } catch (err) {
    console.error('Ошибка при загрузке инструментов:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const close = () => {
  emit('close')
}

onMounted(() => {
  if (props.isOpen) {
    loadTools()
  }
})
</script>

<style lang="scss" scoped>
.tools-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10vh 10vw;

  &__content {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 2rem;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    h3 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }

  &__close {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #f5f5f5;
    color: #333;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background: #e6e6e6;
      color: #000;
    }
  }

  &__loading,
  &__error,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    text-align: center;
  }

  &__retry {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: #f5f5f5;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    
    &:hover {
      background-color: #e6e6e6;
    }
  }
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  padding: 24px;
  
  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #eaeaea;
    
    &:hover {
      background-color: #f5f5f5;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
  }
  
  &__icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background-color: #f5f5f5;
    font-size: 32px;
  }
  
  &__label {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    text-align: center;
  }
  
  &__description {
    font-size: 14px;
    color: #666;
    text-align: center;
    line-height: 1.4;
  }
}
</style> 