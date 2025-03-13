<template>
  <div :class="[type === 'checkbox' ? 'form__group--checkbox' : 'form__group']">
    <label class="form__group-label" v-if="label" :for="id">
      {{ label }}
      <span v-if="required">*</span>
    </label>
    <div class="form__group-input-wrapper">
      <input
        class="form__group-input"
        v-bind="$attrs"
        v-model="internalValue"
        :type="type"
        :id="id"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :class="[
          size && type !== 'checkbox' ? size : '',
          {'form__group-input--basic': !icon },
          { 'input-error': hasError },
          { 'checkbox-input': type === 'checkbox' },
          { 'form__group-input--light': variant === 'light' },
          { 'form__group-input--disabled': disabled },
        ]"
        @blur="validate"
      />
      <span class="form__group-icon" v-if="icon" @click="!disabled && $emit('icon-click')">
        <span :class="icon"></span>
      </span>
    </div>
    <span v-if="hasError" class="form__group-error">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  label: String,
  id: String,
  type: {
    type: String,
    default: 'text',
  },
  variant: {
    type: String,
    default: 'default',
  },
  placeholder: String,
  required: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'large',
  },
  icon: String,
  autocomplete: String,
  modelValue: {
    type: [String, Number, Boolean],
    default: '',
  },
  validators: {
    type: Array as () => Array<(value: any) => string | false>,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const internalValue = ref<string | number | boolean>(props.modelValue)
const hasError = ref<boolean>(false)
const errorMessage = ref<string>('')

const emit = defineEmits(['update:modelValue', 'icon-click'])

const validate = () => {
  if (props.disabled) return

  let validationError: string | false = false

  for (const validator of props.validators) {
    validationError = validator(internalValue.value)
    if (validationError) {
      hasError.value = true
      errorMessage.value = validationError
      return
    }
  }

  hasError.value = false
  errorMessage.value = ''
}

watch(
  () => props.modelValue,
  newValue => {
    internalValue.value = newValue
  },
)

watch(internalValue, newValue => {
  emit('update:modelValue', newValue)
})
</script>

<style lang="scss" scoped>
.form__group {
  display: flex;
  flex-direction: column;
  font-weight: 300;
  font-size: 14px;

  &--checkbox {
    display: flex;
    justify-content: flex-end;
    flex-direction: row-reverse;
    align-items: center;
    gap: 8px;

    .form__group-label {
      margin-bottom: 0;
      font-weight: 500;
      font-size: 14px;
      color: $dark-secondary-color;
    }
    .checkbox-input {
      height: 16px;
      width: 16px;
    }
  }

  &-label {
    font-weight: 300;
    margin-bottom: 8px;

    span {
      color: $danger-color;
    }
  }

  &-input-wrapper {
    position: relative;
  }

  &-input {
    background: $light-grey-color;
    padding: 10px 10px 10px 36px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 300;
    box-sizing: border-box;

    &--basic {
      padding: 10px 10px 10px 15px;
    }

    &::placeholder {
      font-size: 14px;
      font-weight: 300;
      color: $help-color;
    }

    &:focus {
      background-color: $light-color;
      box-shadow: $box-shadow-large;
      outline: none;
    }

    &.input-error {
      border-color: $danger-color;
    }

    &--light {
      background: $light-color;
      border: 1px solid $light-grey-color;
      border-radius: 6px;

      &:focus {
        border-color: $success-color;
        box-shadow: 0 0 0 2px rgba($success-color, 0.2);
      }
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.7;

      &:focus {
        box-shadow: none;
      }
    }
  }

  .small {
    width: 100px;
    height: 40px;
  }

  .medium {
    width: 170px;
    height: 40px;
  }

  .big {
    width: 220px;
    height: 48px;

    & ~ .form__group-icon .icon {
      font-size: 18px;
    }
  }

  .large {
    width: 100%;
    max-height: 36px;
  }

  &-icon {
    position: absolute;
    left: 10px;
    top: 30%;
    cursor: pointer;

    .icon {
      color: $help-color;
      font-size: 14px;
    }
  }
  &-error {
    color: red;
    font-size: 12px;
  }
}
</style>
