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
  max-width: 85%;
  display: flex;
  flex-direction: column;

  &--assistant {
    align-self: flex-start;
  }

  &--typing {
    .message__content {
      padding: 8px 12px;
    }
  }
}

.message__content {
  background: #fff;
  color: #333;
  border-radius: 16px 16px 16px 4px;
  border: 1px solid #f0f0f0;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-dots {
  display: flex;
  gap: 4px;

  span {
    width: 6px;
    height: 6px;
    background: #999;
    border-radius: 50%;
    animation: typing 1s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.typing-text {
  margin: 0;
  font-size: 13px;
  color: #999;
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style> 