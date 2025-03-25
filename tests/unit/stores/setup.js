import { createPinia, setActivePinia } from 'pinia';
/**
 * Настройка Pinia для тестирования
 * Вызывайте эту функцию перед каждым тестом, использующим хранилища
 */
export function setupPiniaForTesting() {
    // Создаем новый экземпляр Pinia для каждого теста
    const pinia = createPinia();
    // Устанавливаем его как активный
    setActivePinia(pinia);
    // Возвращаем экземпляр для использования в тестах
    return pinia;
}
