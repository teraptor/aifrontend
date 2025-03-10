<template>
  <aside class="right-side-menu" :class="{ 'right-side-menu--collapsed': RightSidebarIsOpen }">
    <div class="right-side-menu__header">
      <h3 class="right-side-menu__header-title" v-show="!RightSidebarIsOpen">Компоненты</h3>
      <span
        :class="RightSidebarIsOpen ? 'icon icon-chevron-left' : 'icon icon-chevron-right'"
        @click="toggleRightSidebar"
      />
    </div>
    <div class="right-side-menu__search" v-show="!RightSidebarIsOpen">
      <InputField icon="icon icon-search" size="large" placeholder="Поиск навыков и ассистентов" />
    </div>
    <div class="right-side-menu__container" v-show="!RightSidebarIsOpen">
      <div class="right-side-menu__section">
        <div class="right-side-menu__section-header" @click="toggleAssistens">
          <h4 class="right-side-menu__section-title">Мои ассистенты</h4>
          <span :class="isOpenAssistents ? 'icon icon-chevron-up' : 'icon icon-chevron-down'" />
        </div>
        <ul class="right-side-menu__section-list" v-show="isOpenAssistents">
          <li
            v-for="item in assistentStore.userAssistents"
            :key="item.id"
            class="right-side-menu__section-item"
          >
            <img :src="item.image" class="right-side-menu__section-item-image" />
            <div class="right-side-menu__section-item-content">
              <h4 class="right-side-menu__section-item-title">{{ item.name }}</h4>
              <p class="right-side-menu__section-item-description">{{ item.summary }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="right-side-menu__section">
        <div class="right-side-menu__section-header" @click="toggleSkills">
          <h4 class="right-side-menu__section-title">Навыки</h4>
          <span :class="isOpenSkills ? 'icon icon-chevron-up' : 'icon icon-chevron-down'" />
        </div>
        <ul class="right-side-menu__section-list" v-show="isOpenSkills">
          <li
            v-for="item in skillsStore.skills"
            :key="item.id"
            class="right-side-menu__section-item"
          >
            <span :class="item.icon" class="right-side-menu__section-item-icon" />
            <div class="right-side-menu__section-item-content">
              <h4 class="right-side-menu__section-item-title">{{ item.title }}</h4>
              <p class="right-side-menu__section-item-description">{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useAssistentsStore } from '@/stores/useAssistentsStore';
import { useSkillsStore } from '@/stores/useSkillsStore';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import InputField from '../ui/InputField.vue';

const assistentStore = useAssistentsStore();
const layoutStore = useLayoutStore();
const skillsStore = useSkillsStore();

const isOpenAssistents = ref<boolean>(true);
const isOpenSkills = ref<boolean>(true);
const { RightSidebarIsOpen } = storeToRefs(layoutStore);
const { toggleRightSidebar } = layoutStore;

const toggleAssistens = (): void => {
  isOpenAssistents.value = !isOpenAssistents.value;
};

const toggleSkills = (): void => {
  isOpenSkills.value = !isOpenSkills.value;
};
</script>

<style scoped lang="scss">
.right-side-menu {
  width: 280px;
  height: 100vh;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10;

  &--collapsed {
    width: 72px;
  }

  &__header {
    width: 100%;
    height: 60px;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    &-title {
      font-size: 16px;
      font-weight: 600;
    }

    .icon {
      font-size: 20px;
      padding: 0.5rem;
    }
  }

  &__search {
    border-top: 1px solid rgba($help-color, 20%);
    border-bottom: 1px solid rgba($help-color, 20%);
    padding: 16px;
    width: 100%;
  }

  &__container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 16px;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    gap: 16px;
  }

  &__section {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 24px;

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    &-title {
      font-size: 16px;
      font-weight: 500;
      line-height: 1.5;
    }

    &-list {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    &-item {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: $light-grey-color;
      }

      &-image {
        height: 40px;
        width: 40px;
        border-radius: 8px;
      }

      .icon {
        font-size: 20px;
        width: 40px;
        height: 40px;
        background-color: rgba($help-color, 20%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $help-color;
      }

      &-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
      }

      &-title {
        font-weight: 500;
        font-size: 14px;
      }

      &-description {
        color: $help-color;
        font-size: 12px;
      }
    }
  }
}
</style>