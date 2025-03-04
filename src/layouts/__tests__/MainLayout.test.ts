import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MainLayout from '../MainLayout.vue';
import SideMenu from '@/components/layout/SideMenu.vue';

// Мокаем компонент SideMenu, так как нам важно только его наличие
vi.mock('@/components/layout/SideMenu.vue', () => ({
  default: {
    name: 'SideMenu',
    template: '<div class="side-menu-mock"></div>'
  }
}));

describe('MainLayout', () => {
  it('renders correctly', () => {
    const wrapper = mount(MainLayout);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('layout');
  });

  it('contains SideMenu component', () => {
    const wrapper = mount(MainLayout);
    expect(wrapper.findComponent(SideMenu).exists()).toBe(true);
  });

  it('renders main content area', () => {
    const wrapper = mount(MainLayout);
    expect(wrapper.find('.main-content').exists()).toBe(true);
    expect(wrapper.find('.content-container').exists()).toBe(true);
  });

  it('renders slot content', () => {
    const slotContent = '<div class="test-content">Test Content</div>';
    const wrapper = mount(MainLayout, {
      slots: {
        default: slotContent
      }
    });
    expect(wrapper.html()).toContain('test-content');
    expect(wrapper.html()).toContain('Test Content');
  });

  it('has correct styles', () => {
    const wrapper = mount(MainLayout);
    const mainContent = wrapper.find('.main-content');
    const styles = window.getComputedStyle(mainContent.element);
    
    expect(styles.marginLeft).toBe('280px');
    expect(styles.backgroundColor).toBe('white');
  });
}); 