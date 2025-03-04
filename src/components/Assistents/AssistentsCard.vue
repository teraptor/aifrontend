<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';

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
  isMale: false,
  lastVisit: '10 minutes ago'
});

const startTime = ref(new Date());
const currentTime = ref(new Date());
let timer: number | null = null;
let statusTimer: number | null = null;
const dots = ref('');

const statuses = [
  'смотрит документы',
  'печатает',
  'думает',
  'пьет чай'
];

const currentStatus = ref(statuses[0]);

const updateDots = () => {
  if (dots.value.length >= 3) {
    dots.value = '';
  } else {
    dots.value += '.';
  }
};

const updateStatus = () => {
  const currentIndex = Math.floor(Math.random() * statuses.length);
  currentStatus.value = statuses[currentIndex];
  
  // Устанавливаем следующее обновление через случайное время
  const nextDelay = Math.floor(Math.random() * (10000 - 3000) + 3000); // от 3000 до 10000 мс
  statusTimer = window.setTimeout(updateStatus, nextDelay);
};

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
      isMale: false,
      lastVisit: '10 minutes ago'
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
      isMale,
      lastVisit: '10 minutes ago'
    };
  }

  // Сохраняем в localStorage
  localStorage.setItem(storageKey, JSON.stringify(generatedData.value));
};

const getTimeDisplay = computed(() => {
  if (assistents.id === '1') {
    return `${currentStatus.value}${dots.value}`;
  } else {
    const diffInSeconds = Math.floor((currentTime.value.getTime() - startTime.value.getTime()) / 1000);
    if (diffInSeconds > 50) {
      return 'one minute ago';
    }
    return `${diffInSeconds} seconds ago`;
  }
});

onMounted(() => {
  loadOrGenerateData();
  // Обновляем время каждые 10 секунд
  timer = window.setInterval(() => {
    currentTime.value = new Date();
  }, 10000);

  // Обновляем точки каждые 500мс
  const dotsTimer = setInterval(updateDots, 500);

  // Запускаем первое обновление статуса
  updateStatus();

  // Очищаем таймеры при размонтировании
  onUnmounted(() => {
    if (timer) clearInterval(timer);
    if (statusTimer) clearTimeout(statusTimer);
    if (dotsTimer) clearInterval(dotsTimer);
  });
});

const randomName = computed(() => generatedData.value.name);
const isMale = computed(() => generatedData.value.isMale);
const randomProfession = computed(() => generatedData.value.profession);

const randomAvatar = computed(() => {
  return `https://i.pravatar.cc/150?img=${generatedData.value.avatarId}`;
});

const status = computed(() => {
  if (!isMyDepartment) return null;
  return assistents.id === '1' ? 'Active' : 'Disable';
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
        <h4 class="assistents-card__name">{{ randomName }}</h4>
        <p class="assistents-card__summary">{{ randomProfession }}</p>
        <p v-if="isMyDepartment" 
           class="assistents-card__last-visit"
           :class="{ 'assistents-card__last-visit--runned': assistents.id === '1' }">
          {{ getTimeDisplay }}
        </p>
      </div>
    </div>
    <div class="assistents-card__status" v-if="isMyDepartment">
      {{ status }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.assistents-card {
  position: relative;
  width: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  padding: 24px;
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &--disable {
    opacity: 0.5;
  }

  &--active {
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  &__container {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__image {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    object-fit: cover;
    background: #F5F5F5;
    border: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    &[src] {
      opacity: 1;
    }
  }

  &__name-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    font-size: 16px;
    font-weight: 500;
    color: #111827;
    margin: 0;
    line-height: 1.4;
  }

  &__summary {
    font-size: 14px;
    color: #6B7280;
    line-height: 1.4;
    margin: 0;
  }

  &__status {
    position: absolute;
    top: 24px;
    right: 24px;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 8px;
    background: #22C55E;
    color: #FFFFFF;
  }

  &--disable &__status {
    background: #F3F4F6;
    color: #6B7280;
  }

  &--active &__status {
    background: #22C55E;
    color: #FFFFFF;
  }

  &__last-visit {
    font-size: 12px;
    color: #9CA3AF;
    line-height: 1.4;
    margin: 0;
    margin-top: 4px;
    font-weight: 400;

    &--runned {
      color: rgba(34, 197, 94, 0.5);
    }
  }
}
</style>