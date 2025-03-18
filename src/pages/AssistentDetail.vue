<template>
  <div class="assistent">
    <div class="assistent__header-wrapper">
      <div class="assistent__header-back" @click="goBack">
        <span class="icon icon-arrow-left2" />
        Назад
      </div>
      <TitleWrapper title="Параметры ассистента" />
    </div>
    <div class="assistent-detail" v-if="assistent">
      <div class="assistent-detail__container">
        <img :src="assistent.image" class="assistent-detail__image"/>
        <div class="assistent-detail__name-wrapper">
          <h4 class="assistent-detail__name"> {{ assistent.name }}</h4>
          <p class="assistent-detail__summary"> {{ assistent.summary }}</p>
        </div>
        <Button
            button-type="secondary"
            text="Попробовать"
            type="button"
            size="medium"
            icon="icon icon-arrow-right2"
          />
      </div>

      <Tabs :tabs="tabs" :initialTab="activeTab">
        <template #description>
          <div class="assistent-detail__content">
            <h2 class="assistent-detail__content-title">Пример работы ассистента</h2>
            <p class="assistent-detail__content-text">Автор не предоставил пример работы @{{ assistent.id }}</p>

            <h2 class="assistent-detail__content-title">Описание</h2>
            <p class="assistent-detail__content-text">{{ assistent.description }}</p>
          </div>
        </template>
        <template #comments>
          <div class="assistent-detail__content">
            <div>здесь скоро будет контент</div>
          </div>
        </template>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssistentsStore } from '@/stores/useAssistantsStore';
import { useRouter, useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import Button from '@/components/ui/Button.vue';
import Tabs from '@/components/ui/Tabs.vue';

const assistentsStore = useAssistentsStore();
const router = useRouter();
const route = useRoute();

const assistent = computed(() => assistentsStore.getAssistentById(route.params.id as string)!);

const goBack = (): void => router.back();

const tabs = ref([
  { id: 'description', label: 'Описание' },
  { id: 'comments', label: 'Комментарии' },
]);

const activeTab = ref(tabs.value[0].id);
</script>

<style lang="scss" scoped>
.assistent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  width: 100%;

  &__header-wrapper {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__header-back {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin-bottom: 4px;
    color: $help-color;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      color: $dark-secondary-color;
    }
  }
}

.assistent-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 48rem;
  gap: 16px;

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  &__image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
  }

  &__name-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__name {
    font-weight: 600;
    font-size: 20px;
  }

  &__summary {
    color: $help-color;
    font-size: 14px;
  }

  &__content {
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    &-text {
      color: $help-color;
      line-height: 1.5;
      margin-bottom: 16px;
      white-space: pre-line;
    }
  }
}
</style>
@/stores/useAssistantsStore