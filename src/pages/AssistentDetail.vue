<template>
  <div class="assistent">
  <span class="icon icon-chevron-left" @click="goBack"/>
  <AssistentsDetailNotUser />
  </div>
</template>

<script setup lang="ts">
import AssistentsDetailNotUser from '@/components/Assistents/AssistentsDetailNotUser.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = (): void => router.back()
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