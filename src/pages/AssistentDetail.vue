<template>
  <div class="assistent">
    <span class="icon icon-chevron-left" @click="goBack" />
    <AssistentsDetailUser v-if="isAuthor && authStore.isAuthenticated" :assistent="assistent" />
    <AssistentsDetailNotUser v-else :assistent="assistent" />
  </div>
</template>

<script setup lang="ts">
import AssistentsDetailUser from '@/components/Assistents/AssistentsDetailUser.vue';
import AssistentsDetailNotUser from '@/components/Assistents/AssistentsDetailNotUser.vue';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const assistentsStore = useAssistentsStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const assistent = computed(() => assistentsStore.getAssistentById(route.params.id as string)!);

const isAuthor = computed(() => {
  return assistent.value?.author_id === '1' ;
});

const goBack = (): void => router.back();
</script>
<style lang="scss" scoped>
.assistent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  width: 100%;

  .icon {
    font-size: 30px;
    color: $help-color;
    cursor: pointer;
    height: 40px;
    width: 40px;
    border-radius: 50%;
    background: $light-grey-color;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $danger-color;
    }
  }
}
</style>