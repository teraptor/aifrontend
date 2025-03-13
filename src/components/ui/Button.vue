<template>
  <button
    :type="type"
    :disabled="disabled || isLoading"
    :class="['btn', buttonSize, buttonClass, { active: isActive }]"
  >
    <span v-if="isLoading" class="icon icon-spinner"></span>
    <span v-else class="btn-content">
      <img v-if="image" :src="image" class="btn-content__img"/>
      {{ text }}
      <span v-if="icon" :class="icon"/>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
  type: {
    type: String as PropType<'submit' | 'reset' | 'button'>,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  text: {
    type: [String, Number],
    default: '',
  },
  size: {
    type: String as PropType<'tab' | 'small' | 'medium' | 'big' | 'large' | 'message' | 'curcle'>,
    default: 'large',
  },
  icon: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  buttonType: {
    type: String,
    default: 'primary',
  },
})

const buttonSize = computed(() => `btn-${props.size}`)
const buttonClass = computed(() => `btn-${props.buttonType}`)

const image = computed(() => {
  return props.image ? new URL(`/src/assets/icons/${props.image}`, import.meta.url).href : undefined;
});
</script>
<style lang="scss" scoped>
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $light-color;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  height: 40px;

  &-tab {
    width: 50px;
    height: 32px;
  }

  &-small {
    width: 100px;
    height: 32px;
  }

  &-medium {
    min-width: 140px;
    max-width: 220px;
    height: 40px;
  }

  &-big {
    width: 220px;
    height: 48px;
  }

  &-message {
    width: 100%;
    height: 60px;
  }

  &-curcle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  &-large {
    width: 100%;
    height: 40px;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.btn-text {
  background-color: $light-color;
  border: none;
  text-decoration: underline;
  color: $dark-color;
  outline: none;

  &:hover {
    color: color.scale($primary-color, $lightness: -5%);
  }

  &:disabled {
    color:  color.scale($main-color, $lightness: 10%);
  }

  &.active {
    color: color.scale($primary-color, $lightness: -10%);
  }
}
.btn-light {
  background-color: $light-color;
  border: 1px solid $border-light;
  color: $dark-color;

  &:hover {
    background-color: $light-grey-color;
  }

  &:disabled {
    background-color: $light-color;
    border-color: $border-light;
  }

  &.active {
    background-color: $light-grey-color;
    border-color: $main-color;
    color: $main-color;
  }
}

.btn-primary {
  background-color: $main-color;
  color: $light-color;

  &:hover {
    background-color: color.scale($main-color, $lightness: -5%);
  }

  &:disabled {
    background-color: color.scale($main-color, $lightness: 10%);
  }

  &.active {
    background-color: color.scale($main-color, $lightness: -10%);
  }
}

.btn-secondary {
  background-color: rgba($main-color, 0.1);
  color: $main-color;

  &:hover {
    background-color: rgba($main-color, 0.15);
  }

  &:disabled {
    background-color: rgba($main-color, 0.05);
    color: color.scale($main-color, $lightness: 10%);
  }

  &.active {
    background-color: rgba($main-color, 0.2);
  }
}

.btn-danger {
  background-color: $btn-danger;
  color: $light-color;

  &:hover {
    background-color: color.scale($danger-color, $lightness: -5%);
  }

  &:disabled {
    background-color: $btn-danger-disabled;
  }

  &:active {
    background-color: $btn-danger-active;
  }
}

.btn-light-danger {
  background-color: $light-danger-color;
  color: $light-color;

  &:hover {
    background-color: color.scale($light-danger-color, $lightness: -5%);
  }

  &:disabled {
    background-color: color.scale($light-danger-color, $lightness: 10%);
  }

  &:active {
    background-color: color.scale($light-danger-color, $lightness: -10%);
  }
}

.btn-success {
  background-color: $success-color;
  color: $light-color;

  &:hover {
    background-color: color.scale($success-color, $lightness: -5%);
  }

  &:disabled {
    background-color: color.scale($success-color, $lightness: 10%);
  }

  &.active {
    background-color: color.scale($success-color, $lightness: -10%);
  }
}

.btn-light,
.btn-primary,
.btn-danger,
.btn-light-danger,
.btn-secondary,
.btn-success {
  .icon-spinner {
    animation: spin 1s linear infinite;
  }

  .btn-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-weight: 500;

    &__img {
      height: 20px;
      width: 20px;
    }

    .icon {
      font-size: 16px;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
