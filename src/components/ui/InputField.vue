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
        :class="[
          size && type !== 'checkbox' ? size : '',
          {'form__group-input--basic': !icon },
          { 'input-error': hasError },
          { 'checkbox-input': type === 'checkbox' },
        ]"
        @blur="validate"
      />
      <span class="form__group-icon" v-if="icon" @click="$emit('icon-click')">
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
})

const internalValue = ref<string | number | boolean>(props.modelValue)
const hasError = ref<boolean>(false)
const errorMessage = ref<string>('')

const emit = defineEmits(['update:modelValue', 'icon-click'])

const validate = () => {
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
      font-weight: 300;
    }
    .checkbox-input {
      height: 14px;
      width: 14px;
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
      box-shadow: $box-shadow;
      outline: none;
    }

    &.input-error {
      border-color: $danger-color;
    }
  }

  .small {
    width: 100px;
    max-height: 36px;
  }

  .medium {
    width: 170px;
    max-height: 36px;
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
