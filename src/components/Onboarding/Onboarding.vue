<template>
  <div>
    <button @click="startTour" class="start-tour-button">
      Начать тур
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Shepherd from 'shepherd.js'
import type { Tour } from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'

let tour: Tour

const initTour = () => {
  tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shepherd-theme-custom',
      scrollTo: true,
      cancelIcon: {
        enabled: true
      }
    }
  })

  tour.addStep({
    id: 'welcome',
    text: 'Добро пожаловать в наше приложение!',
    attachTo: {
      element: '#first-step',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Далее',
        action: tour.next
      }
    ]
  })

  tour.addStep({
    id: 'features',
    text: 'Здесь вы найдете все основные функции приложения.',
    attachTo: {
      element: '#second-step',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Назад',
        action: tour.back
      },
      {
        text: 'Далее',
        action: tour.next
      }
    ]
  })

  tour.addStep({
    id: 'settings',
    text: 'Настройте приложение под свои нужды.',
    attachTo: {
      element: '#third-step',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Назад',
        action: tour.back
      },
      {
        text: 'Завершить',
        action: tour.complete
      }
    ]
  })
}

const startTour = () => {
  if (!tour) {
    initTour()
  }
  tour.start()
}

onMounted(() => {
  initTour()
})
</script>

<style scoped>
.start-tour-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.start-tour-button:hover {
  background-color: #45a049;
}

:deep(.shepherd-theme-custom) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.shepherd-theme-custom .shepherd-content) {
  padding: 20px;
}

:deep(.shepherd-theme-custom .shepherd-text) {
  color: #333;
  font-size: 16px;
  line-height: 1.5;
}

:deep(.shepherd-theme-custom .shepherd-button) {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin: 0 5px;
}

:deep(.shepherd-theme-custom .shepherd-button:hover) {
  background: #45a049;
}
</style> 