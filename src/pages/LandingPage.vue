<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="logo">
          <img src="@/assets/forms-logo.svg" alt="Forms Logo" class="forms-logo" />
          <span class="logo-text">Forms</span>
        </div>
        <h1>Онлайн-формы для быстрого сбора статистики</h1>
        <p>Легко создавайте формы и опросы, чтобы собирать и анализировать данные.</p>
        <div class="cta-buttons">
          <button class="cta-button primary">Войти</button>
          <button class="cta-button secondary">Попробовать Формы для работы</button>
        </div>
      </div>
      <div class="hero-image">
        <img src="@/assets/hero-image.svg" alt="Form Builder Preview" />
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2>Почему выбирают нас</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">🎨</div>
          <h3>Простой интерфейс</h3>
          <p>Интуитивно понятный редактор форм</p>
        </div>
        <div class="feature-card">
          <div class="icon">📊</div>
          <h3>Аналитика</h3>
          <p>Подробная статистика и отчеты</p>
        </div>
        <div class="feature-card">
          <div class="icon">🔒</div>
          <h3>Безопасность</h3>
          <p>Защита данных и конфиденциальность</p>
        </div>
        <div class="feature-card">
          <div class="icon">📱</div>
          <h3>Адаптивность</h3>
          <p>Работает на всех устройствах</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <h2>Готовы начать?</h2>
      <p>Создайте свою первую форму прямо сейчас</p>
      <button class="cta-button" @click="startCreating">Начать бесплатно</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { RouteNames } from '@/router/routes/routeNames'

const router = useRouter()

const startCreating = () => {
  router.push({ name: RouteNames.MAIN.name })
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: white;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2rem 4rem;
  background: white;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content {
  max-width: 600px;
  padding-top: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}

.forms-logo {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
}

.logo-text {
  font-size: 1.5rem;
  color: #5f6368;
}

.hero h1 {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: #202124;
  font-weight: 400;
}

.hero p {
  font-size: 1.25rem;
  color: #5f6368;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cta-button.primary {
  background: #1a73e8;
  color: white;
  border: none;
}

.cta-button.primary:hover {
  background: #1557b0;
}

.cta-button.secondary {
  background: white;
  color: #1a73e8;
  border: 1px solid #dadce0;
}

.cta-button.secondary:hover {
  background: #f8f9fa;
}

.hero-image {
  max-width: 45%;
  padding-top: 2rem;
}

.hero-image img {
  width: 100%;
  height: auto;
}

.features {
  padding: 4rem 2rem;
  text-align: center;
}

.features h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #202124;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  padding: 2rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card .icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #202124;
}

.feature-card p {
  color: #5f6368;
}

.cta {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #202124;
}

.cta p {
  font-size: 1.25rem;
  color: #5f6368;
  margin-bottom: 2rem;
}

.cta-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-button:hover {
  background: #1557b0;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }

  .hero-content {
    margin-bottom: 2rem;
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .logo {
    justify-content: center;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-image {
    max-width: 100%;
  }
}
</style> 