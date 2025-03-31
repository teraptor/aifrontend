<template>
  <div class="message message--user">
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
  align-self: flex-end;

  &__content {
    padding: 12px 16px;
    border-radius: 12px;
    position: relative;
    word-wrap: break-word;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    width: 100%;
    box-sizing: border-box;
    background-color: #1890ff;
    color: #ffffff;
    border-bottom-right-radius: 4px;
  }

  &__text {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;

    :deep(a) {
      color: #ffffff;
      text-decoration: underline;
      word-break: break-word;

      &:hover {
        text-decoration: none;
      }
    }
  }

  &__time {
    font-size: 10px;
    color: rgba(#ffffff, 0.8);
    position: absolute;
    bottom: 4px;
    right: 8px;
  }
}
</style> 