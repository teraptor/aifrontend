import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SideMenu from '../SideMenu.vue';
// Мокаем AuthForm компонент
vi.mock('../AuthForm.vue', () => ({
    default: {
        name: 'AuthForm',
        template: '<div class="auth-form-mock"></div>'
    }
}));
describe('SideMenu', () => {
    it('renders correctly', () => {
        const wrapper = mount(SideMenu);
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.classes()).toContain('side-menu');
    });
    it('contains toggle button', () => {
        const wrapper = mount(SideMenu);
        const toggleButton = wrapper.find('.toggle-button');
        expect(toggleButton.exists()).toBe(true);
    });
    it('toggles menu on button click', async () => {
        const wrapper = mount(SideMenu);
        const toggleButton = wrapper.find('.toggle-button');
        expect(wrapper.classes()).not.toContain('side-menu--collapsed');
        await toggleButton.trigger('click');
        expect(wrapper.classes()).toContain('side-menu--collapsed');
        await toggleButton.trigger('click');
        expect(wrapper.classes()).not.toContain('side-menu--collapsed');
    });
    it('shows/hides auth container based on collapsed state', async () => {
        const wrapper = mount(SideMenu);
        const authContainer = wrapper.find('.auth-container');
        expect(authContainer.isVisible()).toBe(true);
        await wrapper.find('.toggle-button').trigger('click');
        await wrapper.vm.$nextTick();
        expect(authContainer.isVisible()).toBe(false);
    });
    it('has correct initial styles', () => {
        const wrapper = mount(SideMenu);
        const styles = window.getComputedStyle(wrapper.element);
        expect(styles.position).toBe('fixed');
        expect(styles.width).toBe('280px');
        expect(styles.zIndex).toBe('10');
    });
    it('updates styles when collapsed', async () => {
        const wrapper = mount(SideMenu);
        const toggleButton = wrapper.find('.toggle-button');
        await toggleButton.trigger('click');
        const styles = window.getComputedStyle(wrapper.element);
        expect(styles.width).toBe('72px');
    });
});
