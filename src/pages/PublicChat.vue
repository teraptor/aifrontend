<template>
  <div class="main">
    <div v-if="isLoading">
      Загрузка...
    </div>
    <div v-else-if="!chatData">
      <p>Чат не найден или произошла ошибка загрузки.</p>
      <AssistentsList />
    </div>
    <div v-else class="chat-container">
      <PublicChat 
        :selected-assistant="selectedAssistant"
        :is-public-access="true"
        @create-new-dialog="createNewDialog"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AssistentsList from '@/components/Assistents/AssistentsList.vue';
import PublicChat from '@/components/chat/PublicChat.vue';
import type { IAssistent } from '@/stores/useAssistantsStore';

// Заголовок страницы для публичного доступа
document.title = 'Публичный чат с ассистентом';

const route = useRoute();
const chatId = ref(route.params.id as string);
const isLoading = ref(true);
const chatData = ref<{ id: string; title: string } | null>(null);

console.log('Инициализация публичного чата, ID из URL:', chatId.value);

// Используем фиксированные данные ассистента для публичного доступа 
const selectedAssistant = ref<IAssistent>({
  id: chatId.value, // Используем ID из URL
  name: 'Ассистент',
  description: 'Публичный доступ к ассистенту',
  summary: 'Публичный чат',
  image: '',
  call_name: 'public_assistant',
  isActive: true,
  isLocked: false,
  isDisabled: false,
  created_at: new Date().toISOString(),
  business: false,
  author_id: 'public'
});

// Функции для обработки событий чата
const createNewDialog = () => {
  // Логика создания нового диалога без API запросов
  console.log('Создание нового публичного диалога');
};

onMounted(async () => {
  console.log('Компонент PublicChat смонтирован');
  
  try {
    isLoading.value = true;
    
    // Проверяем наличие ID чата
    if (chatId.value) {
      console.log('ID чата найден:', chatId.value);
      
      // Обновляем заголовок страницы
      document.title = `Чат с ассистентом ${chatId.value}`;
      
      // Инициализируем данные чата без API запросов
      chatData.value = { 
        id: chatId.value, 
        title: 'Публичный чат с ассистентом' 
      };
    } else {
      console.error('ID чата не найден в URL');
      chatData.value = null;
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных чата:', error);
    chatData.value = null;
  } finally {
    // Короткая задержка для имитации загрузки
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  }
});
</script>

<style lang="scss" scoped>
.main {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.chat-container {
  height: calc(100vh - 120px);
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
}
</style> 