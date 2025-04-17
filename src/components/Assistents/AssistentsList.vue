<template>
  <div class="assistents">
    <TitleWrapper title="Ассистенты" subtitle="Сделано с <span class='icon icon-like'></span> в 2025" />
    <!-- <div class="assistents__nav-group">
      <div class="assistents__btn-group" v-if="authStore.isAuthenticated">
        <InputField
          icon='icon icon-search'
          size="medium"
          placeholder="Найти ассистента"
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>
    </div> -->
    <div class="assistents__list">
      <template v-if="filteredAssistents.length">
        <AssistentsCardTemplate
          v-for="item in filteredAssistents"
          :key="item.id"
          :assistents="item"
        />
      </template>
      <div v-else class="assistents__empty">
        <p>Ассистенты не найдены</p>
      </div>
    </div>
    <AddAssistantModal
      :show="showAddModal"
      @close="closeAddModal"
      @select="handleAssistantSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import TitleWrapper from '../ui/TitleWrapper.vue';
import AssistentsCardTemplate from './AssistentsCardTemplate.vue';
import { useAssistentsStore } from '@/stores/useAssistantsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { SortOption, FilterOption } from '@/stores/useAssistantsStore';
import InputField from '../ui/InputField.vue';
import Button from '../ui/Button.vue';
import { useRouter } from 'vue-router';
import { RouteNames } from '@/router/routes/routeNames';
import AddAssistantModal from '../Modal/AddAssistantModal.vue';

const assistentsStore = useAssistentsStore();
const authStore = useAuthStore();
const isOpenMyAssistents = ref<boolean>(true);
const router = useRouter();
const showAddModal = ref(false);
const searchQuery = ref('');

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement;
  assistentsStore.setSearchQuery(target.value);
};

const filteredAssistents = computed(() => assistentsStore.sortedAssistents);
const userAssistents = computed(() => assistentsStore.userAssistents);

const navigateToCreateAssistent = ():void => {
  router.push(RouteNames.CREATE_ASSISTENT)
}

const openAddModal = () => {
  showAddModal.value = true;
}

const closeAddModal = () => {
  showAddModal.value = false;
}

// TODO: добавить выбор ассистента
const handleAssistantSelect = (assistantId: string) => {
}

const isLoading = computed(() => assistentsStore.isLoading);
const error = computed(() => assistentsStore.error);

const statusClass = computed(() => {
  return (item: any) => {
    if (!item) return '';
    return item.isDisabled ? 'assistents-card__footer-status--disabled' : 
           item.isActive ? 'assistents-card__footer-status--active' : 
           'assistents-card__footer-status--inactive';  // Добавлен класс для неактивных
  };
});

const statusText = computed(() => {
  return (item: any) => {
    if (!item) return '';
    return item.isDisabled ? 'Заблокирован' : 
           item.isActive ? 'Активный' : 
           'Неактивный';  // Добавлен текст для неактивных
  };
});

// загрузка ассистентов
const loadAssistents = async () => {
  try {
    await assistentsStore.fetchAssitantents();
  } catch (e) {
  }
};

onMounted(() => {
  try {
    loadAssistents();
  } catch (error) {
  }
})
</script>

<style lang="scss" scoped>
.assistents {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;

  &__nav-group {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
  }

  &__btn-group {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    min-width: 320px;
    width: 50%;
  }

  &__input-container {
    width: 50%;
  }

  &__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
}

</style>