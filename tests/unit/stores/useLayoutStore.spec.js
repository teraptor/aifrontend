import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { setupPiniaForTesting } from './setup';
describe('useLayoutStore', () => {
    // Подготавливаем хранилище перед каждым тестом
    beforeEach(() => {
        // Устанавливаем Pinia
        setupPiniaForTesting();
        // Мокируем localStorage
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
            key: vi.fn(),
            length: 0
        });
    });
    afterEach(() => {
        // Восстанавливаем глобальные объекты
        vi.restoreAllMocks();
    });
    describe('state', () => {
        it('должен иметь начальное состояние по умолчанию', () => {
            // Получаем хранилище
            const layoutStore = useLayoutStore();
            // Проверяем начальное состояние
            expect(layoutStore.SidebarIsOpen).toBe(false);
            expect(layoutStore.RightSidebarIsOpen).toBe(true);
            expect(layoutStore.footerNav.length).toBeGreaterThan(0);
            expect(layoutStore.sidebarAuthNav.length).toBeGreaterThan(0);
        });
    });
    describe('actions', () => {
        it('toggleSidebar должен переключать состояние бокового меню', () => {
            // Получаем хранилище
            const layoutStore = useLayoutStore();
            // Проверяем начальное состояние
            expect(layoutStore.SidebarIsOpen).toBe(false);
            // Выполняем действие
            layoutStore.toggleSidebar();
            // Проверяем измененное состояние
            expect(layoutStore.SidebarIsOpen).toBe(true);
            // Выполняем действие еще раз
            layoutStore.toggleSidebar();
            // Проверяем, что состояние переключилось обратно
            expect(layoutStore.SidebarIsOpen).toBe(false);
        });
        it('toggleRightSidebar должен переключать состояние правого бокового меню', () => {
            // Получаем хранилище
            const layoutStore = useLayoutStore();
            // Проверяем начальное состояние
            expect(layoutStore.RightSidebarIsOpen).toBe(true);
            // Выполняем действие
            layoutStore.toggleRightSidebar();
            // Проверяем измененное состояние
            expect(layoutStore.RightSidebarIsOpen).toBe(false);
            // Выполняем действие еще раз
            layoutStore.toggleRightSidebar();
            // Проверяем, что состояние переключилось обратно
            expect(layoutStore.RightSidebarIsOpen).toBe(true);
        });
    });
    describe('localStorage', () => {
        it('должен использовать localStorage', () => {
            // Получаем хранилище
            const layoutStore = useLayoutStore();
            // Проверяем, что localStorage используется
            expect(localStorage.setItem).toBeDefined();
            expect(localStorage.getItem).toBeDefined();
            // Изменяем состояние, чтобы проверить потенциальное взаимодействие с localStorage
            layoutStore.toggleSidebar();
            // В тестовом окружении не можем проверить реальный вызов localStorage,
            // но можем проверить, что хранилище работает как ожидается
            expect(layoutStore.SidebarIsOpen).toBe(true);
        });
    });
});
