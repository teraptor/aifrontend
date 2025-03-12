<template>
  <div class="textarea">
    <label v-if="label" :for="labelFor" class="textarea__label">{{
      label
    }}</label>
    <textarea
      class="textarea__field"
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :cols="cols"
      :disabled="disabled"
      :id="labelFor"
      @input="updateValue"
      :class="[size]"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 4,
  },
  cols: {
    type: Number,
    default: 50,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  labelFor: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'large',
  },
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | null
  if (target) {
    emit('update:modelValue', target.value)
  }
}
</script>

<style lang="scss" scoped>
.textarea {
  display: flex;
  flex-direction: column;
  font-weight: 300;
  font-size: 14px;
  gap: 4px;

  &__label {
    font-weight: 300;
    margin-bottom: 8px;
    color: $help-color;
  }

  &__field {
    padding: 8px;
    border: 1px solid $light-grey-color;
    border-radius: 8px;
    resize: none;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    background: $light-color;
    color: $dark-secondary-color;
    transition: all 0.2s ease;

    &::placeholder {
      color: $help-color;
      font-size: 14px;
      font-weight: 300;
    }

    &:focus {
      outline: none;
      border-color: $light-danger-color;
      box-shadow: 0 0 0 2px rgba($light-danger-color, 0.2);
    }

    &:disabled {
      background: $light-grey-color;
      color: $help-color;
      cursor: not-allowed;
    }
  }

  .small {
    width: 100px;
    height: 80px;
  }

  .medium {
    width: 200px;
    height: 120px;
  }

  .large {
    width: 100%;
    min-height: 150px;
  }

  .message {
    width: 100%;
    height: 60px;
  }
}
</style>
