import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Добавляем глобальные моки
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Создаем динамический мок для стилей
let computedStyles = {
  position: 'fixed',
  width: '280px',
  zIndex: '10',
  marginLeft: '280px',
  backgroundColor: 'white',
};

// Добавляем моки для window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: (element: Element) => {
    // Проверяем, является ли элемент свернутым меню
    if (element.classList.contains('side-menu--collapsed')) {
      return {
        ...computedStyles,
        width: '72px',
      };
    }
    return computedStyles;
  },
}); 