<template>
  <div v-if="assistent">
    <h1>{{ assistent.name }}</h1>
    <p>{{ assistent.description }}</p>
    <p>Установки: {{ assistent.install }}</p>
    <p>Статус: {{ assistent.isActive ? 'Активный' : 'Неактивный' }}</p>
  </div>
  <div v-else>
    <p>Ассистент не найден</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAssistentsStore } from '@/stores/useAssistentsStore';

const route = useRoute();
const assistentsStore = useAssistentsStore();

const assistent = computed(() => {
  return assistentsStore.assistants.find((a) => a.id === route.params.id);
});
</script>