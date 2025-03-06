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

const assistentsStore = useAssistentsStore();
const authStore = useAuthStore();
const activeTab = ref<SortOption>(assistentsStore.sortOption);
const activeFilter = ref<FilterOption>('all');
const isOpenMyAssistents = ref<boolean>(true);

const filterLabels: Record<FilterOption, string> = {
  all: 'Все',
  business: 'Бизнес',
  my: 'Мои',
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
</script>

<template>
  <div class="my-assistents" v-if="authStore.isAuthenticated">
    <div class="my-assistents__collapse-toogle">
      <span :class=" isOpenMyAssistents ? 'icon icon-chevron-left' : 'icon icon-chevron-right'" @click="toogleMyAssistents" />
      <TitleWrapper title="Мои ассистенты" subtitle="Управляйте своими ассистентами и настройками" />
    </div>
    <div class="my-assistents__list" v-show="isOpenMyAssistents">
      <AssistentsCard
        v-for="item in userAssistents"
        :key="item.id"
        :assistents="item"
      />
    </div>
  </div>
  <div class="assistents">
    <TitleWrapper title="Ассистенты" subtitle="Prompts & Plugins GPTs" />
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
          button-type="secondary"
          text="Создать ассистента"
          size="medium"
        />
      </div>
    </div>
    <div class="assistents__list">
      <AssistentsCard
        v-for="item in filteredAssistents"
        :key="item.id"
        :assistents="item"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.my-assistents {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;

  &__collapse-toogle {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;

    .icon {
      font-size: 20px;
      line-height: 1.5;
      cursor: pointer;
    }
  }

  &__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

.assistents {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;

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
  }

  &__list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}
</style>