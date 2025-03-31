<template>
  <div class="message message--assistant">
    <div class="message__content">
      <p class="message__text" v-html="formattedText(text)"></p>
      <span class="message__time">{{ formatTime(timestamp) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '@/utils/date'
import { formattedText } from '@/utils/messageFormatter'

defineProps<{
  text: string
  timestamp: string
}>()
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  max-width: 80%;
  width: 100%;
  align-self: flex-start;

  &__content {
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
    word-wrap: break-word;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    width: 100%;
    box-sizing: border-box;
    background-color: #f5f7fa;
    border-bottom-left-radius: 4px;
    min-height: 44px;
  }

  &__text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    color: #333333;

    &:empty {
      display: none;
    }

    :deep(a) {
      color: #1890ff;
      text-decoration: underline;
      word-break: break-word;

      &:hover {
        text-decoration: none;
      }
    }

    :deep(.code-block) {
      background-color: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
    }

    :deep(.mermaid-diagram) {
      margin: 16px 0;
      text-align: center;
    }

    :deep(.math-block) {
      margin: 16px 0;
      text-align: center;
    }

    :deep(.math-inline) {
      font-size: 1.1em;
    }

    :deep(.inline-code) {
      background-color: #f8f9fa;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: monospace;
    }

    :deep(.table-row) {
      display: flex;
      margin: 4px 0;
    }

    :deep(.table-cell) {
      flex: 1;
      padding: 4px;
      border: 1px solid #e8e8e8;
    }
  }

  &__time {
    font-size: 10px;
    color: #999;
    position: absolute;
    bottom: 4px;
    right: 8px;
  }
}
</style> 