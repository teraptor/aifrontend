<script setup lang="ts">
import { computed, ref } from 'vue';
import TitleWrapper from '../ui/TitleWrapper.vue';
import AssistentsCard from './AssistentsCard.vue';
import SortFiltersTab from '../ui/SortFiltersTab.vue';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { SortOption, FilterOption } from '@/stores/useAssistentsStore';
import InputField from '../ui/InputField.vue';
import Button from '../ui/Button.vue';
import { useRouter } from 'vue-router';
import { RouteNames } from '@/router/routes/routeNames';
import AddAssistantModal from '../Modal/AddAssistantModal.vue';

const assistentsStore = useAssistentsStore();
const authStore = useAuthStore();
const activeTab = ref<SortOption>(assistentsStore.sortOption);
const activeFilter = ref<FilterOption>('all');
const isOpenMyAssistents = ref<boolean>(true);
const router = useRouter();
const showAddModal = ref(false);

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

const handleAssistantSelect = (assistantId: string) => {
  // Здесь можно добавить логику добавления ассистента
  console.log('Selected assistant:', assistantId);
}
</script>

<template>
  <div class="my-assistents" v-if="authStore.isAuthenticated">
    <div class="my-assistents__collapse-toogle">
      <span :class=" isOpenMyAssistents ? 'icon icon-chevron-left' : 'icon icon-chevron-right'" @click="toogleMyAssistents" />
      <TitleWrapper title="Мои ассистенты" subtitle="Управляйте своими ассистентами и настройками" />
    </div>
    <div class="my-assistents__list" v-show="isOpenMyAssistents">
      <div class="add-assistant" @click="openAddModal">
        <span class="icon icon-plus"></span>
        <p class="add-assistant__text">Добавить ассистента</p>
      </div>
      <AssistentsCard
        v-for="item in userAssistents"
        :key="item.id"
        :assistents="item"
      />
    </div>

    <AddAssistantModal
      :show="showAddModal"
      @close="closeAddModal"
      @select="handleAssistantSelect"
    />
  </div>
</template>

<style lang="scss" scoped>
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
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
}
</style>