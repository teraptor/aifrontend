<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LoginModal from '@/components/Modal/LoginModal.vue';
import HeroSecondary from '@/components/HeroSecondary.vue';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  // Инициализируем хранилище auth
  await authStore.init();
  
  // Проверяем авторизацию
  if (authStore.isAuthenticated) {
    router.push('/my');
  }
});

const currentSlide = ref(1);
const selectedPeriod = ref(1);

// Базовые цены за месяц
const basePrices = {
  basic: 1990,
  pro: 3990,
} as const;

// Скидки в зависимости от периода
const discounts: Record<number, number> = {
  1: 0,
  3: 0.05, // 5%
  6: 0.10, // 10%
  12: 0.15 // 15%
};

// Вычисляем цены с учетом скидок
const calculatedPrices = computed(() => {
  const discount = discounts[selectedPeriod.value] || 0;
  return {
    basic: Math.round(basePrices.basic * (1 - discount)),
    pro: Math.round(basePrices.pro * (1 - discount))
  };
});

const slides = [
  {
    title: 'RedAist HR',
    description: 'Скрининг кандидатов, создание вакансий, управление процессом найма',
    class: 'max'
  },
  {
    title: 'RedAist Копирайтер',
    description: 'Оптимальна для написания текстов',
    class: 'pro'
  },
  {
    title: 'RedAist SMM',
    description: 'Управление социальными сетями',
    class: 'basic'
  }
];

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
};

const isActive = (index: number) => index === currentSlide.value;

const loginModal = ref<InstanceType<typeof LoginModal> | null>(null);
const openLoginModal = () => {
  loginModal.value?.openModal();
};

const confettiCount = ref(150); // Количество конфетти
const confettiColors = ['#FF6B4A', '#00F0C9', '#FFD700', '#E8F3FF', '#FFEDE8', '#7DE3FF', '#00B37D'];

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const getConfettiStyle = (i: number) => {
  const size = getRandom(6, 12);
  const left = getRandom(0, 100);
  const top = getRandom(0, 100);
  const rotation = getRandom(-45, 45);
  const backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];

  return {
    width: `${size}px`,
    height: `${size / 1.5}px`,
    left: `${left}%`,
    top: `${top}%`,
    backgroundColor: backgroundColor,
    transform: `rotate(${rotation}deg)`
  };
};

// Data for the integration forms
const integrations = ref([
  {
    id: 1,
    title: 'Телеграм → aiОпросер → Sheets',
    description: 'Проведи опросы и собери результаты в Google Таблицы',
    icons: ['#4A90E2', '#FFD700'],
    position: { top: '15%', left: '10%' },
    rotation: -10,
    size: 'medium'
  },
  {
    id: 2,
    title: 'aiРекрутер → Telegram',
    description: 'Уведомление в Telegram о новом кандидате',
    icons: ['#34A853', '#0088CC'],
    position: { top: '25%', right: '5%' },
    rotation: 15,
    size: 'large'
  },
  {
    id: 3,
    title: 'aiСРО → Я',
    description: 'Составь квартальный план по описанию',
    icons: ['#E67E22', '#2C3E50'],
    position: { bottom: '20%', left: '18%' },
    rotation: 5,
    size: 'medium'
  },
  {
    id: 4,
    title: 'aiРекрутер → Я',
    description: 'проводи скоринг кандидатов',
    icons: ['#ECB22E', '#F06A6A'],
    position: { bottom: '15%', right: '15%' },
    rotation: -8,
    size: 'small'
  },
  {
    id: 5,
    title: 'aiМаркетолог → Я',
    description: 'Создай маркетинговый план, запуска промо акций',
    icons: ['#000000', '#7289DA'],
    position: { top: '40%', left: '5%' },
    rotation: 12,
    size: 'small'
  },
  {
    id: 6,
    title: 'aiSMM-ик → Я',
    description: 'Создай план публикаций в соцсетях, с учетом трендов и временных рамок',
    icons: ['#171515', '#0052CC'],
    position: { top: '10%', right: '20%' },
    rotation: -5,
    size: 'small'
  },
  {
    id: 7,
    title: 'aiCTO → Я',
    description: 'Создай план развития компании, проведи анализ зрелости команд',
    icons: ['#0079BF', '#4A154B'],
    position: { bottom: '35%', right: '8%' },
    rotation: 8,
    size: 'medium'
  },
]);
</script>

<template>
  <div class="main">
    <div class="hero-wrapper">
      <div class="confetti-container">
        <div
          v-for="i in confettiCount"
          :key="i"
          class="confetti-piece"
          :style="getConfettiStyle(i)"
        ></div>
      </div>
      <div class="integration-forms-container">
        <div
          v-for="integration in integrations"
          :key="integration.id"
          class="integration-form"
          :class="integration.size"
          :style="{
            top: integration.position.top,
            left: integration.position.left,
            right: integration.position.right,
            bottom: integration.position.bottom,
            transform: `rotate(${integration.rotation}deg)`
          }"
        >
          <div class="integration-icons">
            <div class="icon" :style="{ backgroundColor: integration.icons[0] }"></div>
            <div class="icon" :style="{ backgroundColor: integration.icons[1] }"></div>
          </div>
          <div class="integration-text">
            <h4>{{ integration.title }}</h4>
            <p>{{ integration.description }}</p>
          </div>
        </div>
      </div>
      <div class="hero">
        <h1>AI-интеллект,<br>который умеет больше</h1>
        <p>Делегируй задачи, <br> чтобы сосредоточиться на главном</p>
        <button class="try-button" @click="openLoginModal">Войти и попробовать</button>
      </div>
    </div>
    <HeroSecondary />

    <div class="features">
      <h2 class="features__title">Легко начать<br>
        без знаний и обучения</h2>
      <p class="features__subtitle">Для повседневных и профессиональных задач</p>
      
      <div class="features-grid">
        <div class="feature-block">
          <h2>Умеет <br><span class="highlight-cyan">анализировать</span><br>текст <span class="highlight-cyan">по ссылкам</span></h2>
          <div class="feature-example">
            <div class="example-text">— Сделай cкрининг<br>СV по откликам</div>
            <div class="file-icons">
              <div class="file-icon txt">hh.ru/vacancy/1234567890</div>
            </div>
            <div class="example-response">
              <p class="response-text">
                Совпадение: 90%<br>
                У кандидата нет опыта работы с 1С Битрикс.
              </p>
            </div>
            <div class="file-icons">
              <div class="file-icon pdf">cv.PDF</div>
            </div>  
          </div>
        </div>

        <div class="feature-block">
          <h2>Подскажет,<br><span class="highlight-orange">как выполнить</span> задачу</h2>
          <div class="feature-example">
            <div class="example-text">— Как составить план на месяц?</div>
            <div class="example-response">
              <p class="response-text">
                Давай начнем с того, что мы хотим достичь.
              </p>
            </div>
            <div class="suggestion-buttons">
              <button class="suggestion-btn">Я задам цели на месяц</button>
              <button class="suggestion-btn">Накидай идеи</button>
            </div>
          </div>
        </div>

        <div class="feature-block">
          <h2>Помогает<br><span class="highlight-white">составить план публикаций</span></h2>
          <div class="feature-example">
            <div class="example-text">— В какие дни лучше опубликовать<br>контент?</div>
            <div class="example-response">
              <p class="response-text">
                Исследования показыают, что: лучшее время для публикации контента — в 10:00 и 18:00. Самые пиковые дни для публикации — вторник и четверг.
              </p>
            </div>
          </div>
        </div>
        <button class="try-button" @click="openLoginModal">Войти и попробовать</button>
      </div>
    </div>

    <div class="pricing">
      <h2 class="pricing__title">Выберите свой тариф</h2>
      <p class="pricing__subtitle">
        <span class="highlight-free">Начните бесплатно</span> или выберите план, который подходит вам
      </p>
      
      <div class="period-selector">
        <button class="period-btn" :class="{ active: selectedPeriod === 1 }" @click="selectedPeriod = 1">
          1 месяц
        </button>
        <button class="period-btn" :class="{ active: selectedPeriod === 3 }" @click="selectedPeriod = 3">
          3 месяца
          <span class="discount">5% скидка</span>
        </button>
        <button class="period-btn" :class="{ active: selectedPeriod === 6 }" @click="selectedPeriod = 6">
          6 месяцев
          <span class="discount">10% скидка</span>
        </button>
        <button class="period-btn" :class="{ active: selectedPeriod === 12 }" @click="selectedPeriod = 12">
          12 месяцев
          <span class="discount">15% скидка</span>
        </button>
      </div>

      <div class="pricing-grid">
        <!-- Card 3: Max -->
        <div class="pricing-card max">
          <h3>Enterprise</h3>
          <div class="price">
            <span>По запросу</span>
          </div>
           <ul>
            <li>Все функции Про тарифа</li>
            <li>Неограниченные запросы</li>
            <li>Персональный менеджер</li>
            <li>Ранний доступ к новым функциям</li>
          </ul>
          <button class="try-button" @click="openLoginModal">Выбрать Макс</button>
        </div>
        <!-- Card 1: Basic -->
        <div class="pricing-card basic">
          <div class="popular-badge">🏆 Популярный выбор</div>
          <h3>Базовый</h3>
          <div class="price">
            <span>{{ calculatedPrices.basic }}</span> ₽/{{ selectedPeriod > 1 ? selectedPeriod + ' мес' : 'мес' }}
          </div>
          <ul>
            <li>Доступ к базовым функциям Pro</li>
            <li>Ограниченное количество запросов</li>
            <li>Поддержка по email</li>
          </ul>
          <button class="try-button" @click="openLoginModal">7 дней триал</button>
        </div>
        <!-- Card 2: Pro -->
        <div class="pricing-card pro">
          <h3>Про</h3>
          <div class="price">
            <span>{{ calculatedPrices.pro }}</span> ₽/{{ selectedPeriod > 1 ? selectedPeriod + ' мес' : 'мес' }}
          </div>
           <ul>
            <li>Все функции Базового тарифа</li>
            <li>Увеличенный лимит запросов</li>
            <li>Приоритетная поддержка</li>
            <li>Доступ к API</li>
          </ul>
          <button class="try-button" @click="openLoginModal">Выбрать Про</button>
        </div>
        
      </div>
    </div>

    <LoginModal ref="loginModal" />
  </div>
</template>

<style lang="scss" scoped>
.main {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0;
  background-color: #FFFFFF;
  color: #1A1E23;
}

.logo {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 20px;
  
  span {
    color: #00F0C9;
  }
}

.hero-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #bfede6;
  padding: 60px 20px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.confetti-piece {
  position: absolute;
  border-radius: 2px;
  will-change: transform;
}

.integration-forms-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; // Allow interaction with elements below, forms themselves will enable it
  z-index: 2; // Above confetti, below hero text
}

.integration-form {
  position: absolute;
  background-color: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 10px;
  pointer-events: auto;
  transition: all 0.3s ease;
  border: 1px solid #eee;

  &.small {
    width: 220px;
    padding: 10px 14px;
    
    .integration-text {
      h4 { font-size: 12px; }
      p { font-size: 11px; }
    }
    
    .integration-icons .icon {
      width: 20px;
      height: 20px;
    }
  }

  &.medium {
    width: 280px;
  }

  &.large {
    width: 320px;
    padding: 16px 20px;
    
    .integration-text {
      h4 { font-size: 16px; }
      p { font-size: 13px; }
    }
    
    .integration-icons .icon {
      width: 28px;
      height: 28px;
    }
  }

  &:hover {
    transform-origin: center center;
    transform: scale(1.05) rotate(0deg) translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 10;
  }
}

.integration-icons {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 4px;

  .icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    // Background color set inline
  }
}

.integration-text {
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #1A1E23;
    margin: 0 0 4px 0;
    line-height: 1.3;
  }
  p {
    font-size: 12px;
    color: #6B7280;
    margin: 0;
    line-height: 1.4;
  }
}

.hero {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  position: relative;
  z-index: 3;

  h1 {
    font-size: 82px;
    font-weight: 500;
    margin-bottom: 40px;
    line-height: 1.4;
  }

  p {
    font-size: 30px;
    color: #1A1E23;
    margin-bottom: 0;
  }
}

.try-button {
  background: #FF6B4A;
  color: white;
  border: none;
  padding: 20px 48px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 40px;
  width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(255, 107, 74, 0.25);
  
  &:hover {
    background: #E55A3D;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(255, 107, 74, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 6px 20px rgba(255, 107, 74, 0.2);
  }
}

.features {
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 0;
  position: relative;

  .try-button {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
  }

  @media (max-width: 1200px) {
    padding: 40px 0 120px;
    
    .try-button {
      bottom: 40px;
    }
  }

  @media (max-width: 768px) {
    padding: 30px 0 100px;

    &__title {
      font-size: 32px;
      margin-bottom: 15px;
    }

    &__subtitle {
      font-size: 20px;
      margin-bottom: 30px;
    }
  }

  &__title {
    font-size: 42px;
    line-height: 1.2;
    margin-bottom: 20px;
    font-weight: 600;
    color: #1A1E23;
  }

  &__subtitle {
    font-size: 25px;
    color: #6B7280;
    margin-bottom: 40px;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  height:700px;
  padding: 0 20px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 900px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    max-width: 500px;
    gap: 20px;
  }
}

.feature-block {
  color: #1A1E23;
  
  h2 {
    font-size: 42px;
    line-height: 1.2;
    margin-bottom: 40px;
    font-weight: 600;

    @media (max-width: 1200px) {
      font-size: 36px;
      margin-bottom: 30px;
    }

    @media (max-width: 768px) {
      font-size: 28px;
      margin-bottom: 20px;
    }
  }

  .highlight-cyan {
    color: #03c9a8;
  }

  .highlight-orange {
    color: #FF6B4A;
  }

  .highlight-white {
    color: #1A1E23;
  }
}

.feature-example {
  border-radius: 20px;
  padding: 24px;
  height: 390px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 5px solid #F0F2F5;

  @media (max-width: 768px) {
    height: auto;
    min-height: 300px;
    padding: 20px;
    gap: 15px;
  }
}

.example-text {
  font-size: 18px;
  color: #1A1E23;
  background: #E8F3FF;
  padding: 16px 20px;
  border-radius: 16px;
  align-self: flex-end;
  max-width: 100%;
  margin-bottom: 0;
  flex-shrink: 0;
}

.file-icons {
  display: flex;
  gap: 12px;
  margin: 0;
  align-self: flex-end;
  flex-shrink: 0;

  &:has(.pdf) {
    align-self: flex-start;
  }
}

.file-icon {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.pdf {
    background: #ff856a;
    color: #010503;
    align-self: flex-start;
    &::before {
      content: '📄';
    }
  }
  
  &.txt {
    background: #bff7ed;
    color: #002419;
    &::before {
      content: '📝';
    }
  }
}

.example-response {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex: 1;
  min-height: 0;
  align-self: flex-start;
  width: 80%;
  
  .ai-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: url('@/assets/logo.svg') center/cover;
    flex-shrink: 0;
  }
  
  .response-text {
    font-size: 16px;
    line-height: 1.5;
    color: #1A1E23;
    background: #FFEDE8;
    padding: 16px 20px;
    border-radius: 16px;
    flex: 1;
    overflow-y: auto;
  }
}

.suggestion-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
  width: 80%;
  flex-shrink: 0;
  align-self: flex-start;
}

.suggestion-btn {
  background: #E8FFF3;
  border: 1px solid #D0F3E3;
  border-radius: 12px;
  padding: 14px 20px;
  color: #00B37D;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  &:hover {
    background: #D0F3E3;
    border-color: #00B37D;
  }
}

.text-muted {
  color: rgba(26, 30, 35, 0.6);
  font-size: 14px;
}

.pricing {
  text-align: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pricing__title {
  font-size: 42px;
  line-height: 1.2;
  margin-bottom: 20px;
  font-weight: 600;
  color: #1A1E23;
}

.pricing__subtitle {
  font-size: 25px;
  color: #6B7280;
  margin-bottom: 60px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin: 0 auto 40px;
  max-width: 1200px;
  justify-content: center;
  align-items: start;
}

.pricing-card {
  position: relative;
  background: #F0F2F5;
  border-radius: 20px;
  padding: 35px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 500px;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0, 240, 201, 0.1);
  }

  h3 {
    font-size: 26px;
    margin-bottom: 20px;
    font-weight: 600;
    color: #1A1E23;
  }

  .price {
    font-size: 24px;
    color: #6B7280;
    margin-bottom: 30px;

    span {
      font-size: 42px;
      font-weight: 700;
      color: #1A1E23;
      margin-right: 8px;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 40px 0;
    text-align: left;
    width: 100%;
    color: #6B7280;
    font-size: 15px;

    li {
      margin-bottom: 12px;
      padding-left: 25px;
      position: relative;

      &::before {
        content: '✓';
        color: #00F0C9;
        position: absolute;
        left: 0;
        font-weight: bold;
      }
    }
  }

  .try-button {
    margin-top: auto;
    width: 100%;
    padding: 16px 32px;
    font-size: 18px;
    border-radius: 12px;
  }

  &.trial {
    border-color: #FF6B4A;
    background: #fff1ee;

    .price span {
      font-size: 24px;
      color: #FF6B4A;
    }

    .try-button {
      background: #FF6B4A;
      &:hover {
        background: #E55A3D;
      }
    }
  }

  &.basic {
    border-color: #FFD700;
    background: linear-gradient(180deg, #fffbeb 0%, #F0F2F5 100%);
    transform: scale(1.05);
    z-index: 1;
    height: 500px;

    .popular-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #FFD700;
      color: #000;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
    }

    &:hover {
      transform: scale(1.07);
      box-shadow: 0 10px 30px rgba(255, 215, 0, 0.15);
    }

    .try-button {
      background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
      color: #000;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(255, 215, 0, 0.25);

      &:hover {
        background: linear-gradient(90deg, #FFA500 0%, #FFD700 100%);
        box-shadow: 0 12px 28px rgba(255, 215, 0, 0.3);
      }

      &:active {
        box-shadow: 0 6px 20px rgba(255, 215, 0, 0.2);
      }
    }
  }
}

.period-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 60px;
  flex-wrap: wrap;
  padding: 0 20px;

  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 40px;
  }
}

.period-btn {
  position: relative;
  background: #f0f2f5;
  border: 1px solid #ced4da;
  color: #495057;
  font-size: 16px;
  padding: 10px 25px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &.active {
    background: #343a40;
    color: white;
    border-color: #343a40;
  }

  &:hover:not(.active) {
  }

  @media (max-width: 768px) {
    width: calc(50% - 5px);
    padding: 8px 15px;
    font-size: 14px;

    .discount {
      font-size: 10px;
      padding: 3px 6px;
      top: -15px;
    }
  }
}

.discount {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%) rotate(-5deg);
  background: #ffe8e0;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #FF6B4A;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .period-btn:nth-child(4) & {
      background: #FF6B4A;
      color: white;
  }
}

.period-btn:first-child .discount {
  display: none;
}

.highlight-free {
  background: #00F167;
  color: #000000;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8em;
  display: inline-block;
  vertical-align: baseline;
  margin-left: 5px;
}
</style>