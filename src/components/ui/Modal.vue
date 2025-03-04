<template>
  <div v-if="isOpen" class="modal__overlay" @click="closeModal">
    <div class="modal__content" @click.stop>
      <h4 class="modal__content-title">{{ props.title }}</h4>
      <slot/>
      <div class="modal__close">
        <span class="icon icon-x" @click="closeModal"/>
      </div>
      <div class="modal__help" v-if="props.help">
        {{ props.help }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const isOpen = ref<boolean>(false);

const openModal = (): void => {
  isOpen.value = true;
};

const closeModal = (): void => {
  isOpen.value = false;
};

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  help: {
    type: String,
    default: ''
  }
});

defineExpose({ openModal, closeModal });
</script>

<style scoped lang="scss">
.modal__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($help-color, 20%);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal__content {
  background-color: $light-color;
  padding: 40px 20px 20px;
  border-radius: 20px;
  box-shadow: $box-shadow;
  position: relative;
  width: 380px;
  height: 380px;
  display: flex;
  flex-direction: column;
}

.modal__content-title {
  width: 100%;
  font-weight: 600;
  font-size: 20px;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 16px;
}

.modal__close {
  position: absolute;
  top: 3%;
  right: 3%;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $light-grey-color;
  border-radius: 50%;

  .icon {
    color: $help-color;
  }
}

.modal__help {
  margin-top: auto;
  padding: 10px 22px;
  background-color: $light-grey-color;
  border-radius: 20px;
  text-align: center;
  font-size: 14px;
  color: $help-color;
  line-height: 1.2;
}
</style>