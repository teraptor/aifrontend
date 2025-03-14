<template>
  <div class="skill-level">
    <h3 class="skill-level__title">{{ title }}</h3>
    <div class="skill-level__slider-container">
      <div 
        class="skill-level__slider" 
        @click="handleTrackClick"
        ref="slider"
      >
        <div class="skill-level__track"></div>
        <div 
          class="skill-level__progress" 
          :style="{ width: `${progressWidth}%` }"
        ></div>
        <div 
          class="skill-level__thumb" 
          :style="{ left: `${progressWidth}%` }"
          @mousedown="startDrag"
        >
          <div class="skill-level__active-label" :style="{ left: '50%', transform: 'translateX(-50%)' }">
            {{ labels[activeIndex] }}
          </div>
        </div>
        <div class="skill-level__markers">
          <div 
            v-for="(_, index) in labels" 
            :key="index" 
            class="skill-level__marker"
            :class="{ 'skill-level__marker--active': index <= activeIndex }"
            @click.stop="setValueByIndex(index)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMouse, useEventListener } from '@vueuse/core';

const props = defineProps({
  title: {
    type: String,
    default: 'Креативность'
  },
  modelValue: {
    type: Number,
    default: 0
  },
  labels: {
    type: Array as () => string[],
    default: () => ['Cтажер', 'Робот', 'Справочник', 'Учебник', 'Отличник', 'Помощник', 'Собеседник', 'Фантазёр', 'Выдумщик', 'Художник', 'Фантаст']
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const activeIndex = ref(props.modelValue);
const isDragging = ref(false);
const slider = ref<HTMLElement | null>(null);

const progressWidth = computed(() => {
  const totalSteps = props.labels.length - 1;
  const normalizedValue = activeIndex.value / totalSteps;
  return normalizedValue * 100;
});

const { x } = useMouse();

const updateValue = (clientX: number) => {
  if (props.disabled || !slider.value) return;

  const rect = slider.value.getBoundingClientRect();
  const position = (clientX - rect.left) / rect.width;
  const totalSteps = props.labels.length - 1;

  let newIndex = Math.round(position * totalSteps);
  newIndex = Math.max(0, Math.min(newIndex, totalSteps));

  activeIndex.value = newIndex;
  emit('update:modelValue', newIndex / totalSteps);
};

const handleTrackClick = (event: MouseEvent) => {
  if (props.disabled) return;

  if ((event.target as HTMLElement).classList.contains('skill-level__marker')) {
    return;
  }

  updateValue(event.clientX);
};

const setValueByIndex = (index: number) => {
  if (props.disabled) return;

  const totalSteps = props.labels.length - 1;
  activeIndex.value = index;
  emit('update:modelValue', index / totalSteps);
};

const startDrag = (event: MouseEvent) => {
  if (props.disabled) return;

  event.preventDefault();
  isDragging.value = true;
  updateValue(event.clientX);

  useEventListener(document, 'mousemove', onMouseMove);
  useEventListener(document, 'mouseup', stopDrag);
};

const onMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    updateValue(event.clientX);
  }
};

const stopDrag = () => {
  isDragging.value = false;
};

onMounted(() => {
  const totalSteps = props.labels.length - 1;
  activeIndex.value = Math.round(props.modelValue * totalSteps);
});
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
  }
  
  &__slider {
    position: relative;
    height: 6px;
    background-color: rgba($help-color, 0.1);
    border-radius: 3px;
    cursor: pointer;
  }
  
  &__track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background-color: rgba($help-color, 0.1);
    border-radius: 3px;
  }
  
  &__progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: $progress-color;
    border-radius: 3px;
    transition: width 0.2s ease;
  }
  
  &__thumb {
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    background-color: $progress-color;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    box-shadow: $box-shadow-small;
    transition: left 0.2s ease;
    z-index: 2;
    
    &:hover {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }
  
  &__markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0;
  }
  
  &__marker {
    width: 12px;
    height: 12px;
    background-color: rgba($help-color, 0.1);
    border: 2px solid $light-color;
    border-radius: 50%;
    margin-top: -3px;
    z-index: 1;
    cursor: pointer;
    
    &--active {
      background-color: $progress-color;
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
    background-color: $light-color;
    padding: 2px 8px;
    border-radius: 4px;
    box-shadow: $box-shadow-small;
    transition: all 0.2s ease;
  }
}
</style> 