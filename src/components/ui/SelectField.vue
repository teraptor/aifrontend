<template>
  <div class="select__group">
    <label :for="id" class="select__group-label">
      {{ label }}
      <span v-if="required">*</span>
    </label>
    <div class="select__group-select-wrapper">
      <div
        @blur="validate"
        class="select__group-selected"
        @click="!disabled && toggleDropdown()"
        :class="[
          size,
          { 'select__group-selected--active': isDropdownOpen },
          { 'select__group-selected--error': hasError },
          { 'select__group-selected--light': variant === 'light' },
          { 'select__group-selected--disabled': disabled },
          { placeholder: !selectedOption },
        ]"
      >
        {{ selectedOption || placeholder }}
        <span :class="isDropdownOpen ? 'icon icon-chevron-up' : 'icon icon-chevron-down'" />
      </div>
      <div v-if="isDropdownOpen && !disabled" class="select__group-dropdown">
        <InputField
          v-if="enableSearch"
          v-model="searchQuery"
          type="text"
          id="surname"
          :placeholder="'Поиск...'"
          :disabled="disabled"
        />
        <div
          v-for="(value, key) in filteredOptions"
          :key="key"
          class="select__group-option"
          @click="!disabled && selectOption(value)"
        >
          {{ value }}
        </div>
      </div>
    </div>
    <span v-if="hasError" class="select__group-error">{{ errorMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed, watch } from 'vue'
import InputField from './InputField.vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  enumObject: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Выберите вариант:',
  },
  required: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'large',
  },
  validators: {
    type: Array as () => Array<(value: string) => string | false>,
    default: () => [],
  },
  enableSearch: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'default',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const internalValue = ref<string>(props.modelValue)
const searchQuery = ref<string>('')
const isDropdownOpen = ref<boolean>(false)
const selectedOption = ref<string | null>(props.modelValue)
const hasError = ref<boolean>(false)
const errorMessage = ref<string>('')
const toggleCount = ref<number>(0)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

watch(
  () => props.modelValue,
  newValue => {
    selectedOption.value = newValue
  },
)

const handleInput = (value: string) => {
  internalValue.value = value
  emit('update:modelValue', value)
}

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

const filteredOptions = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return Object.values(props.enumObject).filter(value =>
    value.toLowerCase().includes(query),
  )
})

const toggleDropdown = () => {
  if (props.disabled) return

  toggleCount.value++
  isDropdownOpen.value = !isDropdownOpen.value
  if (toggleCount.value >= 2) validate()
}

const selectOption = (value: string) => {
  if (props.disabled) return

  selectedOption.value = value
  handleInput(value)
  isDropdownOpen.value = false
  validate()
}

watch(internalValue, newValue => {
  emit('update:modelValue', newValue)
})
</script>

<style lang="scss" scoped>
.select__group {
  display: flex;
  flex-direction: column;
  font-weight: 300;
  font-size: 14px;
  gap: 4px;
  cursor: pointer;

  &-label {
    font-weight: 300;
    margin-bottom: 8px;

    span {
      color: $danger-color;
    }
  }

  &-select-wrapper {
    position: relative;
    width: 100%;
  }

  &-selected {
    background: $light-grey-color;
    padding: 10px 10px 10px 15px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 300;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .icon {
      font-size: 14px;
      color: rgba($help-color, 60%);
    }

    &.placeholder {
      font-size: 14px;
      font-weight: 300;
      color: $help-color;
    }

    &--error {
      border-color: $danger-color;
    }

    &--light {
      background: $light-color;
      border: 1px solid $light-grey-color;
      border-radius: 8px;

      &:focus,
      &.select__group-selected--active {
        border-color: $success-color;
        box-shadow: 0 0 0 2px rgba($success-color, 0.2);
      }
    }

    &--active {
      background-color: $light-color;
      box-shadow: $box-shadow-large;
      outline: none;
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  &-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    border: 1px solid $light-grey-color;
    border-radius: 12px;
    max-height: 160px;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: $light-color;
    z-index: 20;
    box-shadow: $box-shadow-large;
  }

  &-search {
    padding: 8px;
    border: 1px solid $light-grey-color;
    border-radius: 4px;
    margin: 8px;
    width: 100%;
  }

  &-option {
    padding: 10px 15px;
    cursor: pointer;

    &:hover {
      background-color: $light-grey-color;
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
  }

  .large {
    width: 100%;
    max-height: 36px;
  }

  &-error {
    color: $danger-color;
    font-size: 12px;
  }
}
</style>