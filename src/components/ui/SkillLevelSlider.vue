<template>
  <div class="skill-level">
    <h3 class="skill-level__title">{{ title }}</h3>
    <div class="skill-level__slider-container">
      <div
        class="skill-level__slider"
        ref="slider"
        @click="handleTrackClick"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <div class="skill-level__track"></div>
        <div
          class="skill-level__progress"
          :style="{ width: `${((progress - 0.1) / 0.9) * 100}%` }"
        ></div>
        <div
          class="skill-level__thumb"
          :style="{ left: `${((progress - 0.1) / 0.9) * 100}%` }"
          @mousedown="startDrag"
        >
          <div
            class="skill-level__active-label"
            :style="{ left: '50%', transform: 'translateX(-50%)' }"
          >
            {{ currentValue }}
          </div>
        </div>
        <div class="skill-level__markers">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="skill-level__marker"
            :class="{ 'skill-level__marker--active': step <= progress }"
            :style="{ left: `${(index / (steps.length - 1)) * 100}%` }"
            @click.stop="setProgress(step)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Прогресс',
  },
  values: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const progress = ref(0.1);

const slider = ref(null);

const isDragging = ref(false);

const stepSize = 0.1;

const steps = computed(() => {
  const stepsArray = [];
  for (let i = 0.1; i <= 1; i += stepSize) {
    stepsArray.push(parseFloat(i.toFixed(1)));
  }
  return stepsArray;
});

const activeIndex = computed(() => {
  return Math.floor((progress.value - 0.1) / stepSize);
});

const currentValue = computed(() => {
  return props.values[activeIndex.value];
});

watch(
  () => props.modelValue,
  (newValue) => {
    progress.value = newValue;
  },
  { immediate: true }
);

const setProgress = (step) => {
  progress.value = step;
  emit('update:modelValue', step);
};

const handleTrackClick = (event) => {
  if (!slider.value) return;

  const trackWidth = slider.value.clientWidth;
  const clickPosition = event.offsetX;
  const newProgress = (clickPosition / trackWidth) * 0.9 + 0.1;
  progress.value = Math.min(Math.max(newProgress, 0.1), 1);
  emit('update:modelValue', progress.value);
};

const startDrag = (event) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleMouseMove = (event) => {
  if (!isDragging.value || !slider.value) return;

  const trackRect = slider.value.getBoundingClientRect();
  const offsetX = event.clientX - trackRect.left;
  const newProgress = (offsetX / trackRect.width) * 0.9 + 0.1;
  progress.value = Math.min(Math.max(newProgress, 0.1), 1);
  emit('update:modelValue', progress.value);
};

const handleMouseUp = () => {
  isDragging.value = false;
};
</script>

<style lang="scss" scoped>
.skill-level {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 20px 0;
  align-items: flex-start;

  &__title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: left;
    color: $dark-secondary-color;
  }

  &__slider-container {
    width: 100%;
    margin-bottom: 30px;
    position: relative;
    padding: 10px 0; /* Добавляем отступ для меток */
  }

  &__slider {
    position: relative;
    height: 6px;
    background-color: #f0f0f0;
    border-radius: 3px;
    cursor: pointer;
  }

  &__track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-color: #f0f0f0;
    border-radius: 3px;
  }

  &__progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #6366f1;
    border-radius: 3px;
    transition: width 0.2s ease;
  }

  &__thumb {
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    background-color: #6366f1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: left 0.2s ease;
    z-index: 2;

    &:hover {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  &__active-label {
    position: absolute;
    top: -35px;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    background-color: white;
    padding: 2px 8px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }

  &__markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0;
    pointer-events: none; /* Чтобы клики по меткам не блокировались */
  }

  &__marker {
    width: 12px;
    height: 12px;
    background-color: #f0f0f0;
    border: 2px solid #fff;
    border-radius: 50%;
    margin-top: -3px;
    z-index: 1;
    cursor: pointer;
    pointer-events: auto; /* Включаем клики для меток */

    &--active {
      background-color: #6366f1;
    }
  }
}
</style>