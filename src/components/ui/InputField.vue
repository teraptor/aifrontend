<template>
  <div class="form__group">
    <label class="form__group-label" :for="id">
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
  gap: 4px;
  font-weight: 300;
  font-size: 14px;

  &-label {
    font-weight: 300;

    span {
      color: $danger-color;
    }
  }

  &-input-wrapper {
    position: relative;
  }

  &-input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 300;
    box-sizing: border-box;

    &::placeholder {
      font-size: 14px;
      font-weight: 300;
      color: $help-color;
    }

    &:focus {
      border-color: #4b9cd3;
      background-color: #fff;
      box-shadow: 0 0 8px rgba(75, 156, 211, 0.5);
      outline: none;
    }

    &.input-error {
      border-color: red;
    }
  }

  .small {
    width: 100px;
    max-height: 36px;
  }

  .medium {
    width: 200px;
    max-height: 36px;
  }

  .large {
    width: 100%;
    max-height: 36px;
  }

  &-icon {
    position: absolute;
    right: 10px;
    top: 30%;
    cursor: pointer;
  }
  &-error {
    color: red;
    font-size: 12px;
  }
}
</style>
