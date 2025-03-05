<template>
  <svg class="workflow-connection" :class="{ 'workflow-connection--active': active }">
    <path
      :d="generatePath"
      :marker-end="showArrow ? 'url(#arrow)' : ''"
      @click="$emit('click')"
    />
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>
    </defs>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  active?: boolean;
  showArrow?: boolean;
}>();

defineEmits(['click']);

const COMPONENT_WIDTH = 240;
const COMPONENT_HEIGHT = 80;
const PORT_OFFSET = 8;

const generatePath = computed(() => {
  const dx = props.endX - props.startX;
  const dy = props.endY - props.startY;
  
  // Определяем точки на портах компонентов
  let [x1, y1, x2, y2] = [props.startX, props.startY, props.endX, props.endY];
  
  // Начальная точка всегда на выходном порту (справа)
  x1 += COMPONENT_WIDTH;
  y1 += COMPONENT_HEIGHT / 2;

  // Конечная точка всегда на входном порту (слева)
  y2 += COMPONENT_HEIGHT / 2;

  // Рассчитываем контрольные точки для кривой Безье
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const minControl = 50;
  const maxControl = 150;
  const controlLength = Math.min(maxControl, Math.max(minControl, distance / 2));

  // Контрольные точки всегда горизонтально от портов
  const cp1x = x1 + controlLength;
  const cp1y = y1;
  const cp2x = x2 - controlLength;
  const cp2y = y2;

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
});
</script>

<style lang="scss" scoped>
.workflow-connection {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: visible;

  path {
    stroke: #6B7280;
    stroke-width: 2;
    fill: none;
    transition: all 0.3s ease;
    pointer-events: auto;
    cursor: pointer;
    
    &:hover {
      stroke-width: 3;
      stroke: #EC4899;
    }
  }

  &--active {
    path {
      stroke: #EC4899;
      stroke-dasharray: 5;
      animation: flow 1s linear infinite;
    }
  }
}

@keyframes flow {
  from {
    stroke-dashoffset: 10;
  }
  to {
    stroke-dashoffset: 0;
  }
}
</style> 