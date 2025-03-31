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

const route = useRoute();
const chatId = ref(route.params.id as string);
const isLoading = ref(true);
const chatData = ref<{ id: string; title: string } | null>(null);
const selectedAssistant = ref<IAssistent>({
  id: '1',
  name: 'Тестовый ассистент',
  description: 'Описание тестового ассистента',
  summary: 'Краткое описание',
  image: '',
  call_name: 'test_assistant',
  isActive: true,
  isLocked: false,
  isDisabled: false,
  created_at: new Date().toISOString(),
  business: false,
  author_id: '1'
});

// Функции для обработки событий чата
const createNewDialog = () => {
  // Логика создания нового диалога
  console.log('Создание нового диалога');
};

onMounted(async () => {
  try {
    isLoading.value = true;
    
    // Имитация загрузки данных чата
    setTimeout(() => {
      chatData.value = { id: chatId.value, title: 'Тестовый чат' };
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    chatData.value = null;
  } finally {
    isLoading.value = false;
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