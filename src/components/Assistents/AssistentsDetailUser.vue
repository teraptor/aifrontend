<template>
  <div class="assistent-setting" v-if="assistent">
    <div class="assistent-setting__container">
      <img :src="assistent.image" class="assistent-setting__image"/>
      <div class="assistent-setting__name-wrapper">
        <h4 class="assistent-setting__name"> {{ assistent.name }}</h4>
        <p class="assistent-setting__summary"> {{ assistent.summary }}</p>
      </div>
    </div>
    <div class="assistent-setting__section">
      <h3 class="assistent-setting__section-title">Основные настройки</h3>
      <div class="assistent-setting__form">
        <InputField
          label="Имя ассистента"
          type="text"
          placeholder="Введите имя"
        />
        <InputField
          label="Роль"
          type="text"
          placeholder="Укажите роль"
        />
        <SelectField
          v-model="language"
          id="language"
          label="Язык"
          :enumObject="LanguagesEnum"
          placeholder="Выберите язык"
          :enableSearch="true"
        />
      </div>
    </div>
    <div class="assistent-setting__section">
      <h3 class="assistent-setting__section-title">Дополнительные настройки</h3>
      <div class="assistent-setting__form">
        <InputField
          label="Получать уведомления"
          type="checkbox"
        />
        <InputField
          label="Автоматические ответы"
          type="checkbox"
        />
      </div>
    </div>
    <Button
      type="submit"
      button-type="success"
      text="Сохранить изменения"
      size="large"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { IAssistent } from '@/stores/useAssistentsStore';
import InputField from '../ui/InputField.vue';
import SelectField from '../ui/SelectField.vue';
import { LanguagesEnum } from '@/enums/enum';
import Button from '../ui/Button.vue';

const props = defineProps({
  assistent: {
    type: Object as () => IAssistent,
    required: true,
  },
})

const { assistent } = props;

const language = '';//заглушка для select компонента
</script>
<style lang="scss">
.assistent-setting {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 48rem;
  gap: 32px;

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
  }

  &__image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  &__name-wrapper {
    width: calc( 100% - 100px - 20px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__name {
    font-weight: 600;
    line-height: 1.5;
    font-size: 24px;
  }

  &__summary {
    color: $help-color;
    line-height: 1.2;
  }

  &__section {
    background: $light-color;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid $light-grey-color;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  &__section-title {
    font-size: 18px;
    font-weight: 500;
    color: $dark-color;
  }

  &__form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 16px;
  }
}

</style>