<template>
  <div class="assistents">
    <TitleWrapper title="Ассистенты" subtitle="Сделано с <span class='icon icon-like'></span> в 2025" />
    <div class="assistents__nav-group">
      <SortFiltersTab
        :sortLabels="sortLabels"
        :filterLabels="filterLabels"
        :activeTab="activeTab"
        :activeFilter="activeFilter"
        @update:sort="changeSortOption"
        @update:filter="changeFilter"
      />
      <div class="assistents__btn-group" v-if="authStore.isAuthenticated">
        <InputField
          icon='icon icon-search'
          size="medium"
          placeholder="Найти ассистента"
        />
        <Button
          button-type="secondary"
          text="Создать ассистента"
          size="medium"
          type="button"
          @click="navigateToCreateAssistent"
        />
      </div>
      <div class="assistents__input-container" v-else>
        <InputField
          icon='icon icon-search'
          size="large"
          placeholder="Найти ассистента"
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
  business: 'Бизнес'
};

const sortLabels: Record<SortOption, string> = {
  popular: 'Популярные',
  new: 'Новые'
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
  console.log('Selected assistant:', assistantId);
}

const isLoading = computed(() => assistentsStore.isLoading)
const err = computed(() => assistentsStore.err)
async function loadAgents() {
  try {
    isLoading.value = true;
    err.value = null;
    console.log("aaaa")
    await assistentsStore.fetchAssitantents();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'ошибка при загрузке списка ассистентов';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  try {
    console.log('onMounted сработал!');
    loadAgents();
  } catch (error) {
    console.error('Ошибка в onMounted:', error);
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
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
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
