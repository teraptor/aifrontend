<script setup lang="ts">
import FAQ from '@/components/FAQ/FAQ.vue';
import { ref } from 'vue';
import LoginModal from '@/components/Modal/LoginModal.vue';

const currentSlide = ref(1);
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
</script>

<template>
  <div class="main">
    <div class="hero">
      <div class="logo">Red<span>Ai</span>st</div>
      <h1>Напарник в работе,<br>который умеет ещё больше</h1>
      <div class="slider-container">
        <button class="nav-button prev" @click="prevSlide">←</button>
        <div class="slider">
          <div class="slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="(slide, index) in slides" :key="index" class="slide-card" :class="slide.class" :active="isActive(index)">
              <h3>{{ slide.title }}</h3>
              <p>{{ slide.description }}</p>
              <div class="chat-interface">
                <div class="input-area">
                  <span class="model-name">{{ slide.title }}</span>
                  <span class="search-text">Искать в сети</span>
                  <div class="action-buttons">
                    <button class="link-btn">🔗</button>
                    <button class="play-btn">▶</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="nav-button next" @click="nextSlide">→</button>
      </div>
      <button class="try-button" @click="openLoginModal">Войти и попробовать</button>
      <div class="hero-secondary">
        <h1 class="big-title">ОБЩАЙТЕСЬ КАК<br>С ЧЕЛОВЕКОМ</h1>
        <div class="subtitle-wrapper">
          <p class="subtitle-text">
            Попробуйте RedAist — AI-ассистент
            <span class="vpn-badge">БЕЗ VPN</span>
            на русском языке
          </p>
          <img src="@/assets/arrow-down-right.svg" alt="Arrow pointing to chat form" class="arrow-icon" />
        </div>

        <div class="chat-form">
          <div class="chat-header">
            <span class="chat-logo">Red<span>Ai</span>st</span>
            <button class="info-button">ⓘ</button>
          </div>
          <div class="chat-input-wrapper">
            <input type="text" placeholder="Сообщение" class="chat-input" />
            <div class="chat-actions">
              <button class="action-button">🔗</button>
              <button class="action-button mic-button">
                <span class="mic-icon">🎤</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <button class="try-button" @click="openLoginModal">Войти и попробовать</button>
    </div>

    <div class="features">
      <h2 class="features__title">Легко начать<br>
        без знаний и обучения</h2>
      <p class="features__subtitle">Для повседневных и профессиональных задач</p>
      
      <div class="features-grid">
        <div class="feature-block">
          <h2>Умеет <span class="highlight-cyan">анализировать</span><br>текст <span class="highlight-cyan">по ссылкам</span></h2>
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
      </div>
      <button class="try-button" @click="openLoginModal">Войти и попробовать</button>
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
  gap: 80px;
  background: linear-gradient(180deg, #0A0F1C 0%, #1A1F2E 100%);
  color: white;
  padding: 40px 20px;
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

.hero {
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 0;

  h1 {
    font-size: 36px;
    font-weight: 500;
    margin-bottom: 40px;
    line-height: 1.4;
  }

  h2 {
    font-size: 32px;
    margin: 40px 0 16px;
  }

  .subtitle {
    color: #8F9BB3;
    font-size: 18px;
    margin-bottom: 40px;
  }
}

.slider-container {
  position: relative;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 0;
  overflow: hidden;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 200px;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, rgba(10, 15, 28, 1) 0%, rgba(10, 15, 28, 0.9) 30%, rgba(10, 15, 28, 0) 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, rgba(10, 15, 28, 1) 0%, rgba(10, 15, 28, 0.9) 30%, rgba(10, 15, 28, 0) 100%);
  }
}

.slider {
  position: relative;
  margin: 0;
  padding: 0 20%;
  overflow: hidden;
}

.slides {
  display: flex;
  transition: transform 0.5s ease;
  gap: 30px;
}

.slide-card {
  flex: 0 0 100%;
  padding: 40px;
  background: #FFFFFF;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transform: scale(0.85);
  opacity: 0.9;
  transition: all 0.5s ease;
  
  &.active {
    transform: scale(1);
    opacity: 1;
  }

  h3 {
    font-size: 32px;
    margin-bottom: 16px;
    color: #000000;
    display: flex;
    align-items: center;
    gap: 8px;

    .version {
      color: #00F0C9;
      font-weight: 500;
    }
  }

  p {
    font-size: 25px;
    color: #6B7280;
    margin-bottom: 32px;
  }
}

.chat-interface {
  margin-top: 30px;
  background: #F5F7FA;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-area {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  .model-name {
    font-size: 16px;
    color: #00F0C9;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;

    &::after {
      content: '2 MAX';
      color: #00F0C9;
    }
  }

  .search-text {
    color: #9CA3AF;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 4px;

    &::after {
      content: 'beta';
      font-size: 12px;
      padding: 2px 6px;
      background: rgba(156, 163, 175, 0.1);
      border-radius: 4px;
    }
  }

  .action-buttons {
    margin-left: auto;
    display: flex;
    gap: 12px;
  }
}

.action-button {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 10px;
  font-size: 18px;
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #6B7280;
  }
  
  &.mic-button {
    background: #1C1F26;
    color: #00F0C9;
    
    &:hover {
      background: #2A2F3A;
    }
  }
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.prev {
    left: 10%;
  }

  &.next {
    right: 10%;
  }
}

.try-button {
  background: #407BFF;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 40px;
  
  &:hover {
    background: #2D5FE3;
  }
}

.features {
  text-align: center;

  &__title {
    font-size: 42px;
    line-height: 1.2;
    margin-bottom: 20px;
    font-weight: 600;
    color: white;
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
  padding: 0 20px;
}

.feature-block {
  color: white;
  
  h2 {
    font-size: 42px;
    line-height: 1.2;
    margin-bottom: 40px;
    font-weight: 600;
  }

  .highlight-cyan {
    color: #00F0C9;
  }

  .highlight-orange {
    color: #FF6B4A;
  }

  .highlight-white {
    color: white;
  }
}

.feature-example {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 24px;
  height: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.example-text {
  font-size: 18px;
  color: #1A1E23;
  background: #F0F2F5;
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
    background: #F0F2F5;
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

.hero-secondary {
  text-align: center;
  margin: 0 auto;
  max-width: 1200px;
  padding: 20px 20px;
  position: relative;
  overflow: visible;
}

.big-title {
  font-size: 82px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin-bottom: 40px;
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle-wrapper {
  position: relative;
  z-index: 2;
  margin-bottom: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 28px;
  color: rgba(255, 255, 255, 0.9);
  padding-right: 50px;
}

.subtitle-text {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 400;
  font-size: 24px;
}

.vpn-badge {
  background: #00F167;
  color: #000000;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 24px;
}

.chat-form {
  position: relative;
  max-width: 800px;
  margin: 80px auto;
  background: rgba(18, 21, 25, 0.7);
  border-radius: 24px;
  padding: 16px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -150%;
    left: -50%;
    right: -50%;
    bottom: -150%;
    background: radial-gradient(
      ellipse at 50% 50%,
      rgba(255, 215, 0, 0.1),
      rgba(255, 215, 0, 0) 70%
    );
    z-index: -1;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background: linear-gradient(180deg, 
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: -1;
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}

.chat-logo {
  font-family: sans-serif;
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 20px;
  color: white;
  
  span {
    color: #00F0C9;
  }
}

.info-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
}

.chat-input-wrapper {
  background: rgba(23, 26, 31, 0.9);
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chat-input {
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
}

.chat-actions {
  display: flex;
  gap: 12px;
}

.arrow-icon {
  position: absolute;
  right: 214px;
  bottom: -88px;
  width: 85px;
  height: 155px;
  pointer-events: none;
  transform: rotate(25deg);
}

@media (max-width: 768px) {
  .big-title {
    font-size: 48px;
  }

  .subtitle-wrapper {
    font-size: 20px;
    flex-direction: column;
  }

  .vpn-badge {
    font-size: 16px;
  }
}

@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>