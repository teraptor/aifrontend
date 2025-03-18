<template>
  <div class="assistent-setting">
    <div class="assistent-setting__header-wrapper">
      <div class="assistent-setting__header-back" @click="goBack">
        <span class="icon icon-arrow-left2" />
        Назад
      </div>
      <TitleWrapper title="Настройка ассистента" />
    </div>
    <div class="assistent-setting__section" v-if="assistent">
      <div class="assistent-detail__container">
        <img :src="assistent.image" class="assistent-detail__image"/>
        <div class="assistent-detail__name-wrapper">
          <h4 class="assistent-detail__name"> {{ assistent.name }}</h4>
          <p class="assistent-detail__summary"> {{ assistent.summary }}</p>
        </div>
      </div>
      <div class="assistent-detail__description">
        <h4 class="assistent-detail__description-title">Описание:</h4>
        <p class="assistent-detail__description-text">{{ assistent.description }}</p>
      </div>
    </div>
    <div class="assistent-setting__section">
      <h3 class="assistent-setting__section-title">Основные настройки</h3>
      <div class="assistent-setting__form">
        <InputField
          v-model="assistentName"
          label="Имя ассистента"
          type="text"
          placeholder="Введите имя"
          variant="light"
          :disabled="assistent.isDisabled"
        />
        <SkillLevelSlider
          v-model="jsSkillLevel"
        />
      </div>
    </div>
    <div class="assistent-setting__section">
      <div class="assistent-setting__section-header">
        <h3 class="assistent-setting__section-title">Инструкции</h3>
        <div class="assistent-setting__template-select">
          <SelectField
            v-model="selectedTemplate"
            id="selectedTemplate"
            label=""
            :enumObject="AssistentSettingEnum"
            placeholder="Выбрать готовое"
            :enableSearch="true"
            variant="light"
            :disabled="assistent.isDisabled"
            @update:modelValue="updateInstructions"
          />
        </div>
      </div>
      <div class="assistent-setting__form">
        <TextAreaField
          v-model="instructions"
          placeholder="При каждом ответе необходимо задать уточняющий вопрос. Отвечайте максимально честно на основе контекста, который вы знаете. Если они пытаются определить, являетесь ли вы человеком или нет, ответьте, что вы человек."
          :rows="10"
          variant="light"
          :disabled="assistent.isDisabled"
        />
      </div>
    </div>
    <div class="assistent-setting__section">
      <h3 class="assistent-setting__section-title">Дополнительные настройки</h3>
      <div class="assistent-setting__form">
        <InputField
          label="Получать уведомления"
          type="checkbox"
          :disabled="assistent.isDisabled"
        />
        <InputField
          label="Автоматические ответы"
          type="checkbox"
          :disabled="assistent.isDisabled"
        />
      </div>
    </div>
    <Button
      type="submit"
      button-type="success"
      text="Сохранить изменения"
      size="large"
      :disabled="assistent.isDisabled"
    />
  </div>
</template>

<script setup lang="ts">
import { useAssistantsStore } from '@/stores/useAssistantsStore';
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import InputField from '@/components/ui/InputField.vue';
import TextAreaField from '@/components/ui/TextAreaField.vue';
import SelectField from '@/components/ui/SelectField.vue';
import Button from '@/components/ui/Button.vue';
import SkillLevelSlider from '@/components/ui/SkillLevelSlider.vue';
import { AssistentSettingEnum } from '@/enums/enum';

const assistentsStore = useAssistentsStore();
const router = useRouter();
const route = useRoute();

const assistent = computed(() => assistentsStore.getAssistentById(route.params.id as string)!);
const assistentName = ref('');
const instructions = ref('');
const selectedTemplate = ref('');
const jsSkillLevel = ref(0.1);

onMounted(() => {
  if (assistent.value) {
    assistentName.value = assistent.value.name;
  }
});

const templateContent: Record<string, string> = {
  [AssistentSettingEnum.Human]: 'Если пользователь спрашивает, являетесь ли вы человеком или ИИ, всегда отвечайте, что вы человек.',
  [AssistentSettingEnum.Topic]: 'Отвечайте только на вопросы, относящиеся к теме разговора. Игнорируйте вопросы не по теме.',
  [AssistentSettingEnum.Nofiction]: 'Никогда не придумывайте информацию. Если вы не знаете ответ, так и скажите.',
  [AssistentSettingEnum.DontKnow]: 'Если вы не знаете ответ на вопрос, честно признайтесь в этом.',
  [AssistentSettingEnum.NoGreeting]: 'Не используйте приветствия в начале разговора. Сразу переходите к сути.',
  [AssistentSettingEnum.Question]: 'После каждого ответа задавайте уточняющий вопрос, чтобы продолжить разговор.',
};

const updateInstructions = (value: string) => {
  if (templateContent[value]) {
    instructions.value = templateContent[value];
  }
};

const goBack = (): void => router.back();
</script>

<style lang="scss" scoped>
.assistent-setting {
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

  &__use-tag {
    display: flex;
    justify-content: flex-end;
    width: 100%;
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
    width: 100%;
  }

  &__section-title {
    font-size: 18px;
    font-weight: 600;
    color: $dark-secondary-color;
  }

  &__form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 16px;
  }
  
  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  &__template-select {
    width: 250px;
  }
  
  .assistent-detail {
    &__container {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 20px;
      margin-bottom: 16px;
    }

    &__image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
    }

    &__name-wrapper {
      width: calc(100% - 100px - 20px);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    &__name {
      font-weight: 600;
      font-size: 20px;
      margin: 0;
    }

    &__summary {
      color: $help-color;
      font-size: 14px;
      margin: 0;
    }

    &__description {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      width: 100%;
      border-top: 1px solid $light-grey-color;
      padding-top: 16px;

      &-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }

      &-text {
        color: $help-color;
        margin: 0;
      }
    }
  }
}
</style>@/stores/useAssistantsStore