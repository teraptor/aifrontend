<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import TitleWrapper from '../ui/TitleWrapper.vue';
import AssistentsCard from './AssistentsCard.vue';
import SortFiltersTab from '../ui/SortFiltersTab.vue';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import type { SortOption, FilterOption } from '@/stores/useAssistentsStore';
import InputField from '../ui/InputField.vue';
import Button from '../ui/Button.vue';
import { useRouter } from 'vue-router';
import { RouteNames } from '@/router/routes/routeNames';

const assistentsStore = useAssistentsStore();
const activeTab = ref<SortOption>(assistentsStore.sortOption);
const activeFilter = ref<FilterOption>('all');
const isMyDepartmentExpanded = ref(false);
const router = useRouter();

// Загружаем сохраненное состояние при монтировании компонента
onMounted(() => {
  const savedState = localStorage.getItem('myAssistentsExpanded');
  if (savedState !== null) {
    isMyDepartmentExpanded.value = JSON.parse(savedState);
  }
});

const filterLabels: Record<FilterOption, string> = {
  all: 'Все',
  business: 'Бизнес',
  my: 'Мои',
};

const sortLabels: Record<SortOption, string> = {
  popular: 'Популярные',
  new: 'Новые',
};

const myAssistents = computed(() => {
  // Возвращаем трех ассистентов
  return [
    {
      id: '1',
      name: 'Даша',
      summary: 'HR-специалист',
      description: 'HR-специалист',
      call_name: 'HR_Dasha',
      likes: 0,
      comments_count: 0,
      verified: true,
      created_at: "2024-03-02T18:15:00Z",
      business: true,
      author_id: '20'
    },
    {
      id: '2',
      name: 'Николай',
      summary: 'HR-специалист',
      description: 'HR-специалист',
      call_name: 'HR_Nikolay',
      likes: 0,
      comments_count: 0,
      verified: true,
      created_at: "2024-03-02T18:15:00Z",
      business: true,
      author_id: '20'
    },
    {
      id: '3',
      name: 'Анна',
      summary: 'HR-специалист',
      description: 'HR-специалист',
      call_name: 'HR_Anna',
      likes: 0,
      comments_count: 0,
      verified: true,
      created_at: "2024-03-02T18:15:00Z",
      business: true,
      author_id: '20'
    }
  ];
});

const changeSortOption = (option: string) => {
  const sortOption = option as SortOption;
  assistentsStore.setSortOption(sortOption);
  activeTab.value = sortOption;
};

const changeFilter = (filter: string) => {
  const filterOption = filter as FilterOption;
  activeFilter.value = filterOption;
  assistentsStore.setActiveFilter(filterOption);
};

const filteredAssistents = computed(() => {
  const sorted = [...assistentsStore.sortedAssistents];
  // Перемещаем разблокированного ассистента в начало списка
  const unlockedIndex = sorted.findIndex(item => item.id === '1');
  if (unlockedIndex > 0) {
    const [unlocked] = sorted.splice(unlockedIndex, 1);
    sorted.unshift(unlocked);
  }
  return sorted;
});

const toggleMyDepartment = () => {
  isMyDepartmentExpanded.value = !isMyDepartmentExpanded.value;
  // Сохраняем новое состояние
  localStorage.setItem('myAssistentsExpanded', JSON.stringify(isMyDepartmentExpanded.value));
};
</script>

<template>
  <div class="assistents">
    <div class="assistents__section">
      <div class="assistents__section-header" @click="toggleMyDepartment">
        <svg 
          class="assistents__section-arrow" 
          :class="{ 'assistents__section-arrow--expanded': isMyDepartmentExpanded }"
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
        >
          <path 
            d="M9 18L15 12L9 6" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
        <h3 class="assistents__section-title">Мои ассистенты</h3>
      </div>
      <div class="assistents__list" v-show="isMyDepartmentExpanded">
        <AssistentsCard
          v-for="item in myAssistents"
          :key="item.id"
          :assistents="item"
          :isMyDepartment="true"
          :isLocked="false"
        />
      </div>
    </div>

    <TitleWrapper 
      title="Ассистенты" 
      subtitle="Сделано для вас с ❤️"
    />
    
    <div class="assistents__nav-group">
      <SortFiltersTab
        :sortLabels="sortLabels"
        :filterLabels="filterLabels"
        :activeTab="activeTab"
        :activeFilter="activeFilter"
        @update:sort="changeSortOption"
        @update:filter="changeFilter"
      />
      <div class="assistents__btn-group">
        <InputField 
          icon='icon icon-search'
          size="medium"
          placeholder="Найти ассистента"
        />
        <Button
          button-type="custom"
          text="Создать ассистента"
          size="medium"
          class="create-button"
          @click="router.push(RouteNames.MAIN.CREATE_ASSISTANT.name)"
        />
      </div>
    </div>
    <div class="assistents__list">
      <AssistentsCard
        v-for="item in filteredAssistents"
        :key="item.id"
        :assistents="item"
        :isMyDepartment="false"
        :isLocked="item.id !== '1'"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assistents {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;

  &__section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 0;
  }

  &__section-arrow {
    transition: transform 0.3s ease;
    
    &--expanded {
      transform: rotate(180deg);
    }
  }

  &__section-title {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  &__nav-group {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__btn-group {
    width: 50%;
    display: flex;
    justify-content: flex-start;
    gap: 16px;

    :deep(.create-button) {
      background-color: #CD7F32;
      color: white;
      
      &:hover {
        background-color: #B26B2A;
      }
    }
  }

  &__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}
</style>