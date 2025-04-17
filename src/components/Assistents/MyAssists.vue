<template>
  <div class="my-assistents" v-if="authStore.isAuthenticated">
    <div class="my-assistents__collapse-toogle">
      <TitleWrapper title="Мои ассистенты" subtitle="Управляйте своими ассистентами и настройками" />
    </div>
    <div class="my-assistents__content" v-show="isOpenMyAssistents">
      <div class="my-assistents__sidebar">
        <router-link :to="{ name: RouteNames.ASSISTENT_LIST }" class="my-assistents__link">
          <div class="my-assistents__link-content">
            <span class="icon icon-file" style="color: #FF6B4A;"></span>
            <span>Выбрать ассистента из шаблона</span>
          </div>
        </router-link>
        <router-link :to="{ name: RouteNames.CREATE_ASSISTENT }" class="my-assistents__link disabled">
          <div class="my-assistents__link-content">
            <span class="icon icon-plus" style="color: #FF6B4A;"></span>
            <span>Создать нового ассистента</span>
          </div>
        </router-link>
      </div>
      <div class="my-assistents__list">
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
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue';
  import TitleWrapper from '../ui/TitleWrapper.vue';
  import AssistentsCard from './AssistentsCard.vue';
  import { useAssistentsStore } from '@/stores/useAssistantsStore';
  import { useAuthStore } from '@/stores/useAuthStore';
  import type { SortOption, FilterOption } from '@/stores/useAssistantsStore';
  import { useRouter } from 'vue-router';
  import { RouteNames } from '@/router/routes/routeNames';

  const assistentsStore = useAssistentsStore();
  const authStore = useAuthStore();
  const isOpenMyAssistents = ref<boolean>(true);
  const router = useRouter();


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

  &__content {
    width: 100%;
    display: flex;
    gap: 24px;
  }

  &__sidebar {
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__link {
    display: flex;
    align-items: center;
    color: rgb(255, 107, 74);
    text-decoration: none;
    font-size: 16px;
    padding: 16px;
    border-radius: 12px;
    border: 2px solid rgba(255, 107, 74, 0.5);
    transition: all 0.2s ease;
    background-color: white;
    width: 100%;

    &:hover {
      background-color: rgba(255, 107, 74, 0.05);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &__link-content {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;

    .icon {
      font-size: 20px;
    }
  }

  &__list {
    flex: 1;
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
    &__content {
      flex-direction: column;
    }

    &__sidebar {
      width: 100%;
      flex-direction: row;
      justify-content: center;
    }

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