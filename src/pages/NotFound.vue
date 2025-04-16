<template>
  <div class="not-found">
    <div class="not-found__inner">
      <div class="not-found__logo">
        <RouterLink to="/">
          <img src="@/assets/logo.png" alt="logo" class="logo"/>
        </RouterLink>
      </div>
      <h2 class="not-found__title">Страница не найдена</h2>
      <img src="@/assets/404.png" class="not-found__image" />
      <p class="not-found__description">
        Страница не найдена, давайте попробуем все заново ?
        <router-link class="not-found__link" to="/"
          >Вернуться на главную</router-link
        >
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0 16px;
  background-color: #FFFFFF;

  &__inner {
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    text-align: center;
    line-height: 1.5;
    padding: 40px;
  }

  &__logo {
    max-width: 250px;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 32px;
    font-weight: 600;
    text-transform: uppercase;
    color: #1A1E23;
  }

  &__image {
    height: 200px;
    width: 220px;
    margin: 20px 0;
  }

  .logo {
    width: 160px;
    height: 40px;
  }

  &__description {
    font-size: 18px;
    font-weight: 400;
    color: #6B7280;
    margin-top: 20px;
  }

  &__link {
    color: #FF6B4A;
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: #E55A3D;
    }
  }
}
</style>
