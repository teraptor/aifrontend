<template>
  <div class="message message--assistant message--typing">
    <div class="message__content typing-indicator">
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="message__text typing-text">Печатает ответ...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message {
  display: flex;
  max-width: 80%;
  width: 100%;
  align-self: flex-start;
  opacity: 0.8;

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
    padding-bottom: 8px;
  }
}

.typing-indicator {
  background-color: #f5f7fa;
  border-bottom-left-radius: 4px;
}

.typing-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  span {
    display: inline-block;
    width: 7px;
    height: 7px;
    background-color: #999;
    border-radius: 50%;
    opacity: 0.6;
    animation: typing 1s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.typing-text {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

@keyframes typing {
  0% {
    transform: translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }
}
</style> 