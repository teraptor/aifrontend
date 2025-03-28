<template>
  <div class="my-assistents" v-if="authStore.isAuthenticated">
    <div class="my-assistents__collapse-toogle">
      <span :class=" isOpenMyAssistents ? 'icon icon-chevron-left' : 'icon icon-chevron-right'" @click="toogleMyAssistents" />
      <TitleWrapper title="Мои ассистенты" subtitle="Управляйте своими ассистентами и настройками" />
    </div>
    <div class="my-assistents__list" v-show="isOpenMyAssistents">
      <div v-if="isLoading" class="loading-wrapper">
        <span class="icon icon-loader"></span>
        <p>Загрузка ассистентов...</p>
      </div>

      <div v-else-if="userAssistents.length === 0" class="no-assistants">
        <p>У вас пока нет ассистентов</p>
      </div>

      <template v-else>
        <AssistentsCard
          v-for="item in userAssistents"
          :key="item.id"
          :assistents="item"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue';
  import TitleWrapper from '../ui/TitleWrapper.vue';
  import AssistentsCard from './AssistentsCard.vue';
  import SortFiltersTab from '../ui/SortFiltersTab.vue';
  import { useAssistentsStore } from '@/stores/useAssistantsStore';
  import { useAuthStore } from '@/stores/useAuthStore';
  import type { SortOption, FilterOption } from '@/stores/useAssistantsStore';
  import InputField from '../ui/InputField.vue';
  import Button from '../ui/Button.vue';
  import { useRouter } from 'vue-router';
  import { RouteNames } from '@/router/routes/routeNames';

  const assistentsStore = useAssistentsStore();
  const authStore = useAuthStore();
  const activeTab = ref<SortOption>(assistentsStore.sortOption);
  const activeFilter = ref<FilterOption>('all');
  const isOpenMyAssistents = ref<boolean>(true);
  const router = useRouter();

  const filterLabels: Record<FilterOption, string> = {
    all: 'Все',
    business: 'Бизнес',
  };

  const sortLabels: Record<SortOption, string> = {
    popular: 'Популярные',
    new: 'Новые',
  };

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

  const toogleMyAssistents = (): void => {
    isOpenMyAssistents.value = !isOpenMyAssistents.value
  }

  const filteredAssistents = computed(() => assistentsStore.sortedAssistents);
  const userAssistents = computed(() => {
    return assistentsStore.userAssistents;
  });

  const isLoading = computed(() => assistentsStore.isLoading);

  const loadAssistents = async () => {
    try {
      await assistentsStore.getMyAssistents();
    } catch (error) {
      console.error('Ошибка при загрузке ассистентов:', error);
    }
  };

  onMounted(() => {
    loadAssistents();
  });

  const navigateToCreateAssistent = ():void => {
    router.push(RouteNames.CREATE_ASSISTENT)
  }
</script>

<style lang="scss" scoped>
.add-assistant-wrapper {
  grid-column: 1 / -1;
  margin-bottom: 8px;
}

.add-assistant {
  width: 100%;
  height: 120px;
  border: 2px dashed $help-color;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba($help-color, 0.05);
  }

  .icon {
    font-size: 24px;
    color: $help-color;
  }

  &__text {
    font-size: 14px;
    color: $help-color;
  }
}

.my-assistents {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 32px;

  &__collapse-toogle {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;

    .icon {
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      color: $help-color;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background-color: $light-grey-color;
      }
    }
  }

  &__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

@media (max-width: 1200px) {
  .my-assistents {
    &__list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .my-assistents {
    &__list {
      grid-template-columns: 1fr;
    }
  }
}

.loading-wrapper {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;

  .icon-loader {
    font-size: 24px;
    color: $help-color;
    animation: spin 1s linear infinite;
  }

  p {
    color: $help-color;
    font-size: 14px;
  }
}

.no-assistants {
  grid-column: 1 / -1;
  text-align: center;
  padding: 24px;
  color: $help-color;
  font-size: 14px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>