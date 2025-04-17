<template>
  <div class="chat-tools">
    <div class="assistant-header__share-button">
      <button class="share-button" @click.stop="openShareModal">
        <span class="share-icon">Share</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ShareModal from '../share/ShareModal.vue'

const props = defineProps<{
  assistantName?: string
  assistantDescription?: string
  assistantId?: string
}>()

const isShareModalOpen = ref(false)

const openShareModal = () => {
  isShareModalOpen.value = true
}

const closeShareModal = () => {
  isShareModalOpen.value = false
}
</script>

<style lang="scss" scoped>
.chat-tools {
  .assistant-header__share-button {
    margin-left: auto;
    padding-left: 8px;
  }

  .share-button {
    background: rgba(24, 144, 255, 0.1);
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    color: #1890ff;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    white-space: nowrap;

    &:hover {
      background: rgba(24, 144, 255, 0.15);
    }

    .share-icon {
      font-size: 12px;
    }
  }
}
</style> 