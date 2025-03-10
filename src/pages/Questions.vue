<!-- нигде не используется -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import TitleWrapper from '@/components/ui/TitleWrapper.vue'
import FilterTabs from '@/components/ui/FilterTabs.vue'

interface Question {
  id: number
  assistantName: string
  assistantAvatar: string
  question: string
  date: string
  isAnswered: boolean
}

const router = useRouter()

const filterOptions = [
  { id: 'all', label: 'Все' },
  { id: 'new', label: 'Новые' },
  { id: 'answered', label: 'Просмотренные' }
]

const currentFilter = ref('all')
const page = ref(1)
const isLoading = ref(false)
const hasMore = ref(true)
const itemsPerPage = 5

// Имитация базы данных с большим количеством вопросов
const allQuestions = [
  {
    id: 1,
    assistantName: 'Александр',
    assistantAvatar: '👨🏻‍💼',
    question: 'Как улучшить точность моих ответов на технические вопросы?',
    date: '2024-03-05',
    isAnswered: false
  },
  {
    id: 2,
    assistantName: 'Мария',
    assistantAvatar: '👩🏻‍💼',
    question: 'Могу ли я получить доступ к дополнительным базам данных?',
    date: '2024-03-04',
    isAnswered: true
  },
  {
    id: 3,
    assistantName: 'Дмитрий',
    assistantAvatar: '👨🏻‍💻',
    question: 'Как мне лучше интегрироваться с IDE пользователя?',
    date: '2024-03-03',
    isAnswered: false
  },
  {
    id: 4,
    assistantName: 'Анна',
    assistantAvatar: '👩🏻‍🔬',
    question: 'Нужна помощь в анализе больших объемов данных. Какие инструменты лучше использовать?',
    date: '2024-03-02',
    isAnswered: true
  },
  {
    id: 5,
    assistantName: 'Сергей',
    assistantAvatar: '👨🏻‍🏫',
    question: 'Как мне улучшить обучающие материалы для новых пользователей?',
    date: '2024-03-01',
    isAnswered: false
  },
  // Дополнительные вопросы для демонстрации подгрузки
  {
    id: 6,
    assistantName: 'Елена',
    assistantAvatar: '👩🏻‍💻',
    question: 'Как оптимизировать процесс обработки естественного языка?',
    date: '2024-02-29',
    isAnswered: false
  },
  {
    id: 7,
    assistantName: 'Игорь',
    assistantAvatar: '👨🏻‍🔬',
    question: 'Нужны рекомендации по улучшению алгоритмов машинного обучения',
    date: '2024-02-28',
    isAnswered: true
  },
  {
    id: 8,
    assistantName: 'Татьяна',
    assistantAvatar: '👩🏻‍🏫',
    question: 'Как лучше организовать взаимодействие с пользователем?',
    date: '2024-02-27',
    isAnswered: false
  }
]

const questions = ref<Question[]>([])

// Имитация загрузки данных с сервера
const loadQuestions = async () => {
  if (isLoading.value || !hasMore.value) return

  isLoading.value = true
  
  // Имитация задержки загрузки
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  const newQuestions = allQuestions.slice(start, end)
  
  if (newQuestions.length > 0) {
    questions.value.push(...newQuestions)
    page.value++
  }
  
  if (end >= allQuestions.length) {
    hasMore.value = false
  }
  
  isLoading.value = false
}

const filteredAndSortedQuestions = computed(() => {
  let filtered = [...questions.value]
  
  if (currentFilter.value === 'new') {
    filtered = filtered.filter(q => !q.isAnswered)
  } else if (currentFilter.value === 'answered') {
    filtered = filtered.filter(q => q.isAnswered)
  }
  
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const handleScroll = () => {
  if (isLoading.value || !hasMore.value) return

  const scrollPosition = window.scrollY + window.innerHeight
  const pageHeight = document.documentElement.scrollHeight
  
  // Загружаем новые вопросы, когда пользователь прокрутил до конца с небольшим запасом
  if (pageHeight - scrollPosition < 100) {
    loadQuestions()
  }
}

const handleAnswer = (questionId: number) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question) {
    question.isAnswered = true
  }
}

const handleCardClick = (questionId: number) => {
  router.push(`/questions/${questionId}`)
}

// Сброс фильтра и перезагрузка вопросов
const resetAndReload = () => {
  questions.value = []
  page.value = 1
  hasMore.value = true
  loadQuestions()
}

watch(currentFilter, resetAndReload)

onMounted(() => {
  loadQuestions()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="questions-page">
    <TitleWrapper 
      title="Вопросы ассистентов" 
      subtitle="Ответьте на вопросы ваших ассистентов"
    />
    
    <div class="questions-filters">
      <FilterTabs
        v-model="currentFilter"
        :options="filterOptions"
      />
    </div>
    
    <div class="questions-list">
      <div 
        v-for="question in filteredAndSortedQuestions" 
        :key="question.id" 
        class="question-card"
        :class="{ 'question-card--answered': question.isAnswered }"
        @click="handleCardClick(question.id)"
      >
        <div class="question-card__header">
          <div class="assistant-info">
            <span class="assistant-avatar">{{ question.assistantAvatar }}</span>
            <span class="assistant-name">{{ question.assistantName }}</span>
          </div>
          <span class="question-date">{{ new Date(question.date).toLocaleDateString('ru-RU') }}</span>
        </div>
        
        <div class="question-content">
          <p class="question-text">{{ question.question }}</p>
        </div>
        
        <div class="question-card__footer">
          <button 
            class="answer-button"
            :class="{ 'answer-button--answered': question.isAnswered }"
            @click="handleAnswer(question.id)"
            :disabled="question.isAnswered"
          >
            {{ question.isAnswered ? 'Отвечено' : 'Ответить' }}
          </button>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        Загрузка...
      </div>
      
      <div v-if="!hasMore && filteredAndSortedQuestions.length > 0" class="no-more">
        Больше вопросов нет
      </div>
      
      <div v-if="filteredAndSortedQuestions.length === 0" class="no-questions">
        Нет вопросов для отображения
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.questions-page {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.questions-filters {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
  position: sticky;
  top: 20px;
  z-index: 10;
  padding: 8px 0;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &--answered {
    background: #F9FAFB;
  }
}

.question-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assistant-avatar {
  font-size: 24px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
  border-radius: 50%;
}

.assistant-name {
  font-weight: 500;
  color: #111827;
}

.question-date {
  color: #6B7280;
  font-size: 14px;
}

.question-content {
  margin-bottom: 16px;
}

.question-text {
  color: #374151;
  line-height: 1.5;
  margin: 0;
}

.question-card__footer {
  display: flex;
  justify-content: flex-end;
}

.answer-button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #4B9093;
  color: white;

  &:hover {
    background: darken(#4B9093, 5%);
  }

  &--answered {
    background: #10B981;
    cursor: default;

    &:hover {
      background: #10B981;
    }
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 50px;
  color: #6B7280;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #D1D5DB;
  border-top-color: #4B9093;
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.no-more,
.no-questions {
  text-align: center;
  padding: 16px;
  color: #6B7280;
  font-size: 14px;
  background: #F9FAFB;
  border-radius: 8px;
}
</style> 