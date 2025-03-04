<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

const props = defineProps({
  assistents: {
    type: Object,
    required: true,
  },
  isMyDepartment: {
    type: Boolean,
    default: false
  }
})

const { assistents, isMyDepartment } = props;

const maleNames = [
  'Сергей', 'Александр', 'Дмитрий', 'Андрей', 'Михаил',
  'Евгений', 'Иван', 'Алексей', 'Николай', 'Артём'
];

const femaleNames = [
  'Анна', 'Елена', 'Мария', 'Ольга', 'Ирина',
  'Татьяна', 'Наталья', 'Екатерина', 'Юлия', 'Светлана'
];

const professions = [
  'Маркетолог', 'Дизайнер', 'Разработчик', 'Аналитик', 'Контент-менеджер',
  'SMM-специалист', 'SEO-специалист', 'Копирайтер', 'PR-менеджер', 'HR-специалист'
];

// Сохраняем сгенерированные данные
const generatedData = ref({
  name: '',
  profession: '',
  avatarId: 0,
  isMale: false
});

// Загружаем или генерируем данные
const loadOrGenerateData = () => {
  const storageKey = `assistant_${assistents.id}`;
  const savedData = localStorage.getItem(storageKey);
  
  if (savedData) {
    generatedData.value = JSON.parse(savedData);
    return;
  }

  // Для отдела "Мой ИИ отдел" генерируем только HR Дашу
  if (isMyDepartment) {
    generatedData.value = {
      name: 'Даша',
      profession: 'HR-специалист',
      avatarId: 1,
      isMale: false
    };
  } else {
    // Для остальных ассистентов оставляем случайную генерацию
    const isMale = Math.random() > 0.5;
    const names = isMale ? maleNames : femaleNames;
    const name = names[Math.floor(Math.random() * names.length)];
    const profession = professions[Math.floor(Math.random() * professions.length)];
    const avatarId = Math.floor(Math.random() * 1000);

    generatedData.value = {
      name,
      profession,
      avatarId,
      isMale
    };
  }

  // Сохраняем в localStorage
  localStorage.setItem(storageKey, JSON.stringify(generatedData.value));
};

onMounted(() => {
  loadOrGenerateData();
});

const randomName = computed(() => generatedData.value.name);
const isMale = computed(() => generatedData.value.isMale);
const randomProfession = computed(() => generatedData.value.profession);

const randomAvatar = computed(() => {
  return `https://i.pravatar.cc/150?img=${generatedData.value.avatarId}`;
});

const status = computed(() => {
  if (!isMyDepartment) return null;
  return Math.random() > 0.5 ? 'Active' : 'Disable';
});

const statusClass = computed(() => {
  if (!status.value) return '';
  return `assistents-card--${status.value.toLowerCase()}`;
});
</script>

<template>
  <div class="assistents-card" :class="statusClass">
    <div class="assistents-card__container">
      <img 
        :src="randomAvatar" 
        class="assistents-card__image" 
        alt="avatar"
        loading="lazy"
        decoding="async"
      />
      <div class="assistents-card__name-wrapper">
        <h4 class="assistents-card__name">{{ randomProfession }} {{ randomName }}</h4>
        <p class="assistents-card__summary">{{ isMyDepartment ? 'ИИ ассистент' : 'ИИ ассистент' }}</p>
      </div>
    </div>
    <div class="assistents-card__like-wrapper" v-if="!isMyDepartment">
      <p class="assistents-card__like">
        {{ assistents.likes }}
      </p>
      <span class="icon icon-like" />
    </div>
    <div class="assistents-card__status" v-if="isMyDepartment">
      {{ status }}
    </div>
    <div class="assistents-card__verified" v-if="assistents.verified && !isMyDepartment">
      <span class="icon icon-verified" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assistents-card {
  position: relative;
  max-width: 250px;
  width: 100%;
  height: 120px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: $light-grey-color;
  padding: 12px;
  border-radius: 20px;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: scale(1.04);
  }

  &--disable {
    opacity: 0.4;
  }

  &--active {
    background: rgba($success-color, 0.1);
  }

  &__container {
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 12px;
  }

  &__image {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    object-fit: cover;
    background: white;
    border: 1px solid rgba($help-color, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
    
    &[src] {
      opacity: 1;
    }
  }

  &__name-wrapper {
    width: calc( 100% - 64px - 12px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  &__name {
    font-weight: 600;
    line-height: 1.5;
  }

  &__summary {
    color: $help-color;
    line-height: 1.2;
    font-size: 14px;
  }

  &__like-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 4px;
    max-height: 20px;
  }

  &__like {
    font-size: 14px;
    font-weight: 600;
    color: $help-color;
    line-height: 1.5;
    height: 100%;
  }

  &__status {
    position: absolute;
    top: 2%;
    right: 2%;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 12px;
    background: $success-color;
    color: white;
  }

  &--disable &__status {
    background: $help-color;
  }

  &__verified {
    position: absolute;
    top: 2%;
    right: 2%;

    .icon {
      font-size: 30px;
      color: $main-color;
    }
  }
}
</style>