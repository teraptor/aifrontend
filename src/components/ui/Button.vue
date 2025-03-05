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
    type: String as PropType<'tab' | 'small' | 'medium' | 'big' | 'large'>,
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
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: $light-color;
  font-size: 14px;
  font-weight: 300;
  max-height: 48px;

  &-tab {
    width: 50px;
    height: 32px;
  }

  &-small {
    width: 100px;
    height: 32px;
  }
  &-medium {
    width: 170px;
    height: 36px;
  }
  &-big {
    width: 220px;
    height: 48px;
  }


  &-large {
    width: 100%;
    max-height: 36px;
  }
  &:focus {
    outline: none;
  }
}

.btn-light {
  background-color: $light-color;
  border: 1px solid rgba($help-color, 40%);
  color: $dark-color;

  &:hover {
    background-color: color.adjust($light-color, $lightness: -2%);
    border: 1px solid rgba($help-color, 40%);
    color: $dark-color;
  }

  &:disabled {
    background-color: $light-color;
    opacity: 0.5;
    border: 1px solid rgba($help-color, 40%);
    color: $dark-color;
    cursor: not-allowed;
  }

  &.active {
    background-color: color.adjust($light-color, $lightness: -5%);
    border: 1px solid rgba($help-color, 40%);
    color: $dark-color;
  }
}

.btn-primary {
  background-color: $btn-primary;
  border: none;

  &:disabled {
    background-color: $btn-primary-disabled;
    cursor: not-allowed;
  }
  &.active {
    background-color: $btn-primary-active;
  }
}

.btn-secondary {
  background-color: $btn-secondary;
  border: none;

  &:disabled {
    background-color: $btn-secondary-disabled;
    cursor: not-allowed;
  }
  &.active {
    background-color: $btn-secondary-active;
  }
}

.btn-danger {
  background-color: $btn-danger;
  border: none;

  &:disabled {
    background-color: $btn-danger-disabled;
    cursor: not-allowed;
  }
  &:active {
    background-color: $btn-danger-active;
  }
}

.btn-success {
  background-color: $btn-success;
  border: none;

  &:disabled {
    background-color: $btn-success-disabled;
    cursor: not-allowed;
  }
  &:active {
    background-color: $btn-success-active;
  }
}

.btn-light,
.btn-primary,
.btn-danger,
.btn-secondary,
.btn-success {
  .icon-spinner {
    animation: spin 1s linear infinite;
  }
  .btn-content {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    font-weight: 400;

    &__img {
      height: 24px;
      width: 24px;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
