<template>
  <div class="assistent">
    <div class="assistent__header-wrapper">
      <div class="assistent__header-back" @click="goBack">
        <span class="icon icon-arrow-left2" />
        Назад
      </div>
      <TitleWrapper :title="getTitle" />
    </div>
    <AssistentsDetailUser v-if="isAuthor" :assistent="assistent" />
    <AssistentsDetailNotUser v-else :assistent="assistent" />
  </div>
</template>

<script setup lang="ts">
import AssistentsDetailUser from '@/components/Assistents/AssistentsDetailUser.vue';
import AssistentsDetailNotUser from '@/components/Assistents/AssistentsDetailNotUser.vue';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';

const assistentsStore = useAssistentsStore();
const router = useRouter();
const route = useRoute();

const assistent = computed(() => assistentsStore.getAssistentById(route.params.id as string)!);

const isAuthor = computed(() => {
  return assistent.value?.author_id === '1' ;
});

const goBack = (): void => router.back();

const getTitle = computed(() => {
  return isAuthor.value ? 'Настройка ассистента' : 'Параметры ассистента'
})
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
</style>