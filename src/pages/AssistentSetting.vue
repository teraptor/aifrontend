<template>
  <div class="two-column-layout">
    <!-- Левая колонка -->
    <div class="column column--left">
      <!-- Переключатель -->
      <div class="mode-toggle">
        <button 
          class="mode-toggle__button" 
          :class="{ 'mode-toggle__button--active': activeMode === 'assistant' }"
          @click="activeMode = 'assistant'"
        >
          Ассистент
        </button>
        <button 
          class="mode-toggle__button" 
          :class="{ 'mode-toggle__button--active': activeMode === 'settings' }"
          @click="activeMode = 'settings'"
        >
          Настройка
        </button>
      </div>

      <!-- Чат или настройки в зависимости от режима -->
      <div v-if="activeMode === 'assistant'" class="chat-container">
        <PublicChat 
          :selected-assistant="assistent || null"
          :is-public-access="false"
          :hide-header="true"
        />
      </div>
      <div v-else class="settings-container">
        <!-- Содержимое настроек -->
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
                <div v-if="isEditingName" class="edit-field-container">
                  <input 
                    v-model="assistentName" 
                    @blur="toggleNameEdit" 
                    @keyup.enter="toggleNameEdit"
                    ref="nameInput"
                    class="edit-field"
                  />
                </div>
                <h4 v-else class="assistent-detail__name" @click="toggleNameEdit">
                  {{ assistent.name }}
                  <span class="edit-icon">✎</span>
                </h4>
                
              </div>
              <div class="assistent-detail__button-group">
                <Button
                  type="submit"
                  button-type="danger"
                  text="Удалить ассистента"
                  size="medium"
                  @click="confirmDeleteAssistent"
                />
                <Button
                  type="submit"
                  button-type="primary"
                  :text="isSaving ? 'Сохранение...' : 'Сохранить'"
                  size="medium"
                  :disabled="!hasChanges || isSaving"
                  @click="saveChanges"
                  class="save-button"
                />
              </div>
            </div>
            <div class="assistent-detail__description">
              <h4 class="assistent-detail__description-title">Описание:</h4>
              <div v-if="isEditingDescription" class="edit-field-container">
                <textarea 
                  v-model="description" 
                  @blur="toggleDescriptionEdit" 
                  @keyup.enter="toggleDescriptionEdit"
                  ref="descriptionInput"
                  class="edit-field edit-field--textarea"
                  rows="4"
                ></textarea>
              </div>
              <p v-else class="assistent-detail__description-text" @click="toggleDescriptionEdit">
                {{ assistent.description }}
                <span class="edit-icon">✎</span>
              </p>
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
                @keydown.ctrl.enter="saveChanges"
                @input="autoExpandTextarea"
                class="auto-expand"
              />
              <div class="assistent-setting__hint" v-if="!assistent?.status">
                Для быстрого сохранения используйте Ctrl+Enter
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Правая колонка -->
    <div class="column column--right">
      <PublicChat 
        :selected-assistant="assistent || null"
        :is-public-access="false"
        :hide-header="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssistentsStore } from '@/stores/useAssistantsStore';
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, onMounted, watch, onUnmounted } from 'vue';
import TitleWrapper from '@/components/ui/TitleWrapper.vue';
import InputField from '@/components/ui/InputField.vue';
import TextAreaField from '@/components/ui/TextAreaField.vue';
import SelectField from '@/components/ui/SelectField.vue';
import Button from '@/components/ui/Button.vue';
import SkillLevelSlider from '@/components/ui/SkillLevelSlider.vue';
import { AssistentSettingEnum } from '@/enums/enum';
import { notifications } from '@/plugins/notifications';
import type { IAssistent } from '@/stores/useAssistantsStore';
import PublicChat from '@/components/chat/PublicChat.vue';

const assistentsStore = useAssistentsStore();
const router = useRouter();
const route = useRoute();

const assistent = computed(() => assistentsStore.getAssistentById(route.params.id as string));
const assistentName = ref('');
const instructions = ref('');
const description = ref('');
const jsSkillLevel = ref(0.1);
const summaryText = ref('');
const selectedTemplate = ref('');
const isEditingName = ref(false);
const isEditingSummary = ref(false);
const isEditingDescription = ref(false);
const nameInput = ref<HTMLInputElement | null>(null);
const summaryInput = ref<HTMLInputElement | null>(null);
const descriptionInput = ref<HTMLTextAreaElement | null>(null);
const instructionsTextarea = ref<HTMLTextAreaElement | null>(null);
const showDeleteConfirm = ref(false);
const isSaving = ref(false);
const originalData = ref<{
  name: string;
  description: string;
  instructions: string;
  summary: string;
}>({ name: '', description: '', instructions: '', summary: '' });
const hasChanges = ref(false);

// Добавляю расширение интерфейса IAssistant, чтобы включить дополнительные поля
interface IAssistentWithExtendedFields extends IAssistent {
  instructions?: string;
  skillLevel?: number;
}

const confirmDeleteAssistent = () => {
  if (confirm('Вы уверены, что хотите удалить этого ассистента?')) {
    deleteAssistent(route.params.id as string);
  }
}

const updateAssistant = async () => {
  return saveChanges();
}

const deleteAssistent = async (id: string) => {
  try {
    await assistentsStore.deleteAssistent(id);
    router.push('/my');
    notifications.success('Ассистент успешно удален');
  } catch(error) {
    notifications.error('Ошибка удаления ассистента');
  }
}

const saveChanges = async () => {
  try {
    if (!assistent.value) return;
    
    // Устанавливаем флаг сохранения
    isSaving.value = true;
    
    // Создаем объект с данными для обновления
    const updateData = {
      name: assistentName.value,
      summary: summaryText.value,
      description: description.value,
      instructions: instructions.value,
    };
    
    
    // Проверяем, что поле инструкций не пустое
    if (!updateData.instructions.trim()) {
      notifications.error('Поле инструкций не может быть пустым');
      isSaving.value = false;
      return;
    }
    
    // Обновляем ассистента
    await assistentsStore.updateAssistent(assistent.value.id, updateData);
    
    // После успешного сохранения обновляем оригинальные данные
    updateOriginalData();
    hasChanges.value = false;
    
    // Обновляем данные в объекте ассистента
    if (assistent.value) {
      assistent.value.instructions = instructions.value;
    }
    
    notifications.success('Ассистент успешно обновлен');
  } catch(error) {
    notifications.error('Ошибка обновления ассистента');
  } finally {
    // Сбрасываем флаг сохранения независимо от результата
    isSaving.value = false;
  }
}

const updateOriginalData = () => {
  if (assistent.value) {
    originalData.value = {
      name: assistentName.value,
      description: description.value,
      instructions: instructions.value,
      summary: summaryText.value
    };
  }
}

// Отслеживаем изменения во всех полях
watch([assistentName, description, instructions, summaryText], () => {
  if (originalData.value) {
    hasChanges.value = 
      originalData.value.name !== assistentName.value ||
      originalData.value.description !== description.value ||
      originalData.value.instructions !== instructions.value ||
      originalData.value.summary !== summaryText.value;
  }
}, { deep: true });

const autoExpandTextarea = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
};

onMounted(async () => {
  // Проверяем, загружены ли ассистенты
  if (!assistentsStore.assistants.length) {
    // Если нет, загружаем их
    await assistentsStore.getMyAssistents();
  }
  
  // Обновляем assistent после загрузки данных
  if (assistent.value) {
    assistentName.value = assistent.value.name;
    description.value = assistent.value.description || '';
    summaryText.value = assistent.value.summary || '';
    jsSkillLevel.value = assistent.value.skillLevel || 0.1;
    
    // Получаем полные данные ассистента через API для получения instructions
    try {
      const agentData = await assistentsStore.fetchAssistentById(assistent.value.id);
      if (agentData && agentData.instructions) {
        instructions.value = agentData.instructions;
        // Обновляем значение в объекте ассистента
        assistent.value.instructions = agentData.instructions;
      } else {
        instructions.value = assistent.value.instructions || '';
      }
    } catch (error) {
      instructions.value = assistent.value.instructions || '';
    }
    
    // Сохраняем изначальные данные для отслеживания изменений
    updateOriginalData();
    
  } else {
    // Если ассистент не найден после загрузки, возвращаемся назад
    router.push('/assistents');
  }
  
  // Добавляем обработчик для автоматического расширения textarea
  if (instructionsTextarea.value) {
    instructionsTextarea.value.addEventListener('input', autoExpandTextarea);
  }
});

// Добавляем очистку обработчика при размонтировании компонента
onUnmounted(() => {
  if (instructionsTextarea.value) {
    instructionsTextarea.value.removeEventListener('input', autoExpandTextarea);
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
    if (confirm('Вы хотите использовать выбранный шаблон?')) {
      instructions.value = templateContent[value];
      hasChanges.value = true;
      
      // Добавляем автоматическое сохранение при выборе шаблона
      if (assistent.value) {
        saveChanges();
      } else {
        notifications.success('Шаблон применен');
      }
    } else {
      // Если отмена, сбрасываем выбор шаблона
      selectedTemplate.value = '';
      notifications.info('Шаблон не применен');
    }
  }
};

const goBack = (): void => router.back();

// Функции для редактирования полей
const toggleNameEdit = () => {
  if (!isEditingName.value) {
    isEditingName.value = true;
    // Фокус на поле после рендеринга
    setTimeout(() => {
      if (nameInput.value) {
        nameInput.value.focus();
      }
    }, 0);
  } else {
    isEditingName.value = false;
    if (assistent.value) {
      // Обновляем значение в assistent, но без сохранения на сервер
      assistent.value.name = assistentName.value;
    }
  }
};

const toggleSummaryEdit = () => {
  if (!isEditingSummary.value) {
    isEditingSummary.value = true;
    // Фокус на поле после рендеринга
    setTimeout(() => {
      if (summaryInput.value) {
        summaryInput.value.focus();
      }
    }, 0);
  } else {
    isEditingSummary.value = false;
    if (assistent.value) {
      // Обновляем значение в assistent, но без сохранения на сервер
      assistent.value.summary = summaryText.value;
    }
  }
};

const toggleDescriptionEdit = () => {
  if (!isEditingDescription.value) {
    isEditingDescription.value = true;
    // Фокус на поле после рендеринга
    setTimeout(() => {
      if (descriptionInput.value) {
        descriptionInput.value.focus();
      }
    }, 0);
  } else {
    isEditingDescription.value = false;
    if (assistent.value) {
      // Обновляем значение в assistent, но без сохранения на сервер
      assistent.value.description = description.value;
    }
  }
};

// Добавляем состояние для переключателя
const activeMode = ref('assistant');
</script>

<style lang="scss" scoped>
.two-column-layout {
  display: flex;
  gap: 24px;
  width: 100%;
  height: 100vh;
  padding: 24px;
  background: #f5f5f5;
  padding: 13px 20px;
}

.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-width: 0;
  
  &--left, &--right {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
  }
}

.mode-toggle {
  display: flex;
  gap: 2px;
  background: #f0f0f0;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 16px;
  
  &__button {
    flex: 1;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    &--active {
      background: white;
      color: #007AFF;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

.chat-container, .settings-container {
  flex: 1;
  overflow: auto;
}

.assistent-setting {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  width: 100%;

  &__header-wrapper {
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
    padding: 16px 0;
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
    background-color: rgba(2, 7, 29, 0.0392156863);
    border-radius: 8px;
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
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    &__name {
      font-weight: 600;
      font-size: 20px;
      margin: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      
      &:hover {
        // Удаляю фоновую подсветку
        // background-color: rgba($light-grey-color, 0.3);
        // border-radius: 4px;
      }
    }

    &__summary {
      color: $help-color;
      font-size: 14px;
      margin: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      
      &:hover {
        // Удаляю фоновую подсветку
        // background-color: rgba($light-grey-color, 0.3);
        // border-radius: 4px;
      }
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
        cursor: pointer;
        display: flex;
        align-items: center;
        
        &:hover {
          // Удаляю фоновую подсветку и отступы
          // background-color: rgba($light-grey-color, 0.3);
          // border-radius: 4px;
          // padding: 4px;
        }
      }
    }

    &__button-group {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }

  .edit-field-container {
    width: 100%;
  }
  
  .edit-field {
    width: 100%;
    padding: 8px;
    border: 1px solid $primary-color;
    border-radius: 4px;
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: $secondary-color;
    }
    
    &--textarea {
      resize: vertical;
      min-height: 100px;
      line-height: 1.5;
      font-family: inherit;
      overflow: hidden;
      transition: height 0.2s ease;
    }
  }

  .auto-expand {
    min-height: 100px;
    height: auto;
    overflow-y: hidden;
    resize: none;
    transition: height 0.2s ease;
    
    &:focus {
      outline: none;
    }
  }

  .edit-icon {
    font-size: 14px;
    margin-left: 8px;
    color: #555;
    display: inline-block;
  }

  .save-button {
    margin-top: 10px;
  }

  .assistent-setting__hint {
    font-size: 12px;
    color: $help-color;
    text-align: right;
  }
}
</style>