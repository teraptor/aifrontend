<template>
  <div class="hero-secondary">
    <h1 class="big-title">ОБЩАЙТЕСЬ КАК<br>С ЧЕЛОВЕКОМ</h1>
    <div class="subtitle-wrapper">
      <p class="subtitle-text">
        Попробуйте <span class="logo-text">Red<span>Ai</span>st</span> — AI-ассистент
        <span class="vpn-badge">БЕЗ VPN</span>
        на русском языке
      </p>
      <img src="@/assets/arrow-down-right.svg" alt="Arrow pointing to chat form" class="arrow-icon" />
    </div>

    <div class="chat-form">
      <div class="chat-header">
        <span class="logo-text">Red<span>Ai</span>st</span> Сайт → aiОпросер → Sheets
        <button class="info-button">ⓘ</button>
      </div>
      <div class="chat-input-wrapper">
        <input type="text" placeholder="Сообщение" class="chat-input" />
        <div class="chat-actions">
          <button class="action-button send-button">Enter</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.hero-secondary {
  text-align: center;
  margin: 0 auto;
  max-width: 1200px;
  padding: 20px 20px;
  position: relative;
  overflow: visible;
}

.big-title {
  font-size: 82px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  margin-bottom: 40px;
  background: linear-gradient(180deg, #333 0%, #000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle-wrapper {
  position: relative;
  z-index: 2;
  margin-bottom: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 28px;
  color: #6B7280;
  padding-right: 50px;
}

.subtitle-text {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 400;
  font-size: 24px;
}

.vpn-badge {
  background: #00F167;
  color: #000000;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 24px;
}

.chat-form {
  position: relative;
  max-width: 800px;
  margin: 80px auto;
  background: #FFFFFF;
  border-radius: 24px;
  padding: 16px;
  // border: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1;
  box-shadow: 0 4px 100px rgb(191 237 230);
  border: 5px solid #F0F2F5;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}

.chat-logo {
  font-family: sans-serif;
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 25px;
  color: #1A1E23;
  
  span {
    color: #00F0C9;
  }
}

.info-button {
  background: none;
  border: none;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  
  &:hover {
    color: rgba(0, 0, 0, 0.8);
  }
}

.chat-input-wrapper {
  background: #F6F7FB;
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #1A1E23;
  font-size: 16px;
  outline: none;
  padding: 8px 12px;
  
  &::placeholder {
    color: #6B7280;
  }
}

.chat-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  
  &.send-button {
    background: #FF6B4A;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s ease;
    
    &:hover {
      background: #E55A3D;
    }
  }
}

.arrow-icon {
  position: absolute;
  right: -15px;
  bottom: -88px;
  width: 85px;
  height: 155px;
  pointer-events: none;
  transform: rotate(25deg);
}

.logo-text {
  font-family: sans-serif;
  font-weight: 800;
  letter-spacing: 1px;
  color: #FF6B4A;
  
  span {
    color: #03c9a8;
  }
}

@media (max-width: 768px) {
  .big-title {
    font-size: 48px;
  }

  .subtitle-wrapper {
    font-size: 20px;
    flex-direction: column;
  }

  .vpn-badge {
    font-size: 16px;
  }
}

img[alt="Arrow pointing to chat form"] {
  filter: invert(48%) sepia(11%) saturate(392%) hue-rotate(182deg) brightness(94%) contrast(87%);
}
</style> 