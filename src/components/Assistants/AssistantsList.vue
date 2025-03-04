<template>
  <div class="assistants">
    <div class="assistants-header">
      <h1>Ассистенты</h1>
      <p class="subtitle">Prompts & Plugins GPTs</p>
      
      <div class="tabs-search">
        <div class="tabs">
          <button class="tab active">Популярные</button>
          <button class="tab">Свежие</button>
          <button class="tab">Все</button>
          <button class="tab">Мои</button>
          <button class="tab">Бизнес</button>
        </div>
        
        <div class="search-create">
          <div class="search">
            <input type="text" placeholder="Найти ассистента" />
            <span class="search-icon">🔍</span>
          </div>
          <button class="create-button">Создать ассистента</button>
        </div>
      </div>
    </div>

    <div class="assistants-grid">
      <div v-for="assistant in assistants" :key="assistant.id" class="assistant-card">
        <img :src="assistant.avatar" :alt="assistant.name" class="assistant-avatar" />
        <div class="assistant-info">
          <h3>{{ assistant.name }}</h3>
          <p>{{ assistant.description }}</p>
        </div>
        <div class="assistant-likes">
          {{ assistant.likes }} <span class="heart">♡</span>
        </div>
      </div>
    </div>

    <div class="faq-section">
      <h2>FAQ</h2>
      <p class="faq-subtitle">Может быть полезно</p>
      
      <div class="faq-list">
        <div v-for="(item, index) in faqItems" :key="index" class="faq-item">
          <button 
            class="faq-button" 
            @click="toggleFaq(index)"
            :class="{ 'active': openFaqIndex === index }"
          >
            <div class="faq-button-content">
              <span class="faq-icon">+</span>
              <span class="faq-question">{{ item.question }}</span>
            </div>
          </button>
          <div class="faq-answer" v-show="openFaqIndex === index">
            {{ item.answer }}
          </div>
        </div>
      </div>

      <div class="footer-links">
        <a href="#" class="footer-link">О продукте</a>
        <a href="#" class="footer-link">Для бизнеса</a>
        <a href="#" class="footer-link">О нас</a>
        <a href="#" class="footer-link">Цены</a>
        <a href="#" class="footer-link">Блог</a>
        <a href="#" class="footer-link">API</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const openFaqIndex = ref<number | null>(null);

const toggleFaq = (index: number) => {
  openFaqIndex.value = openFaqIndex.value === index ? null : index;
};

const faqItems = [
  {
    question: 'Как ChatGPT работает в России?',
    answer: 'Наш сервис "GPTunnel" официально использует прямую интеграцию к чату GPT от компании OpenAI, имея с ними договор на оказание данной деятельности в России. Мы рады делиться с пользователями из РФ возможностью использовать последние технологии в области AI на русском языке, как в качестве онлайн сервисов, так и при помощи API-функционала.'
  },
  {
    question: 'А что насчёт MidJorney?',
    answer: 'Ответ про MidJorney'
  },
  {
    question: 'Использование ChatGPT бесплатно?',
    answer: 'Ответ про стоимость использования'
  },
  {
    question: 'Могу ли я создать изображение?',
    answer: 'Ответ про создание изображений'
  },
  {
    question: 'Поддерживают ли Chat GPT и MidJourney русский язык?',
    answer: 'Ответ про поддержку русского языка'
  },
  {
    question: 'Что такое токены?',
    answer: 'Ответ про токены'
  },
  {
    question: 'Как создать фото похожим на меня?',
    answer: 'Ответ про создание похожих фото'
  }
];

const assistants = [
  {
    id: 1,
    name: 'Рефератер',
    description: 'Помогает делать рефераты',
    likes: 463,
    avatar: '/avatars/referater.png'
  },
  {
    id: 2,
    name: 'Перефразировщик',
    description: 'Обучен писать красиво',
    likes: 491,
    avatar: '/avatars/paraphraser.png'
  },
  {
    id: 3,
    name: 'Дизайнер',
    description: 'Дизайнер логотипов',
    likes: 285,
    avatar: '/avatars/designer.png'
  },
  {
    id: 4,
    name: 'Презентация',
    description: 'Презентация.',
    likes: 221,
    avatar: '/avatars/presentation.png'
  },
  {
    id: 5,
    name: 'Маркетолог',
    description: 'Знает все про идеи',
    likes: 338,
    avatar: '/avatars/marketer.png'
  },
  {
    id: 6,
    name: 'программист',
    description: 'поможет программировать',
    likes: 296,
    avatar: '/avatars/programmer.png'
  }
];
</script>

<style scoped>
.assistants {
  padding: 2rem 2.5rem;
}

.assistants-header {
  margin-bottom: 2.5rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin: 0.25rem 0 2rem;
}

.tabs-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0;
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab.active {
  color: #111827;
  border-bottom-color: #111827;
}

.search-create {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search {
  position: relative;
}

.search input {
  padding: 0.625rem 2.5rem 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 240px;
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.create-button {
  padding: 0.625rem 1.25rem;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-button:hover {
  background: #6d28d9;
}

.assistants-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.assistant-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 1rem;
  transition: all 0.2s;
  cursor: pointer;
}

.assistant-card:hover {
  background: #f3f4f6;
}

.assistant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  object-fit: cover;
}

.assistant-info {
  flex: 1;
  min-width: 0;
}

.assistant-info h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assistant-info p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assistant-likes {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
}

.heart {
  font-size: 1.25rem;
  line-height: 1;
}

.faq-section {
  margin-top: 4rem;
  padding-top: 2rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.faq-subtitle {
  color: #6b7280;
  margin: 0.25rem 0 2rem;
  font-size: 0.875rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.faq-item {
  border-radius: 0;
  overflow: visible;
}

.faq-button {
  width: 100%;
  padding: 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #111827;
  text-align: left;
  font-weight: 500;
}

.faq-button-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.faq-question {
  font-size: 1rem;
}

.faq-icon {
  font-size: 1.5rem;
  color: #111827;
  transition: transform 0.2s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  flex-shrink: 0;
}

.faq-button.active .faq-icon {
  transform: rotate(45deg);
  background: #e5e7eb;
}

.faq-answer {
  padding: 0 1.25rem 1.25rem 3.5rem;
  color: #374151;
  font-size: 1rem;
  line-height: 1.6;
  background: none;
}

.faq-list {
  gap: 0;
}

.footer-links {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.footer-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #111827;
}
</style> 