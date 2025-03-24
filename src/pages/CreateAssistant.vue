<template>
  <div class="layout">
    <SideMenu />
    <div class="create-assistant" :class="{ 'with-collapsed-menu': isComponentsMenuCollapsed }">
      <div 
        class="components-layout"
        @dragover.prevent="handleDragOver"
        @drop.prevent="handleDrop"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @wheel.prevent="handleWheel"
        :class="{ 'components-layout--drag-over': isDragging }"
      >
        <div 
          class="components-layout__content"
          :style="{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${scale})`,
          }"
        >
          <div class="components-layout__workflow">
            <WorkflowConnection
              v-for="(connection, index) in connections"
              :key="index"
              v-bind="connection"
            />
            <div 
              v-for="component in selectedComponents" 
              :key="component.id"
              :data-component-id="component.id"
              class="workflow-component"
              :class="{
                [`workflow-component--${component.type}`]: true,
                'workflow-component--connecting': connectingFrom?.id === component.id,
                'workflow-component--connectable': connectingFrom && connectingFrom.id !== component.id
              }"
              :style="{
                left: `${component.position.x}px`,
                top: `${component.position.y}px`
              }"
              draggable="true"
              @click="handleComponentClick(component)"
              @dragstart="handleDragStart($event, component)"
              @dragend="handleDragEnd"
              @mousedown.stop="handleMouseDown"
              @contextmenu.prevent="showContextMenu($event, component)"
            >
              <div class="workflow-component__header">
                <div class="workflow-component__icon">
                  <template v-if="component.type === 'assistant'">
                    <img :src="component.avatar" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" />
                  </template>
                  <component v-else :is="component.icon" />
                </div>
                <div v-if="component.type === 'assistant'" class="workflow-component__info">
                  <div class="workflow-component__name">{{ component.name }}</div>
                  <div class="workflow-component__description">{{ component.role }}</div>
                </div>
              </div>
              <div class="workflow-component__ports">
                <div 
                  class="port port--input"
                  @mousedown.stop="startConnection(component, 'input')"
                ></div>
                <div 
                  class="port port--output"
                  @mousedown.stop="startConnection(component, 'output')"
                ></div>
              </div>
              <div 
                v-if="contextMenu.visible && contextMenu.componentId === component.id" 
                class="workflow-component__context-menu"
              >
                <div 
                  class="workflow-component__context-menu-item workflow-component__context-menu-item--delete"
                  @click.stop="removeComponent(component)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M3 7H21M16 7L15.2511 4.13572C15.0929 3.52425 14.5259 3.1 13.8854 3H10.1146C9.47408 3 8.90714 3.52425 8.74891 4.13572L8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Удалить
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="components-menu" :class="{ 'components-menu--collapsed': isComponentsMenuCollapsed }">
      <div class="components-menu__header" @click="toggleComponentsMenu">
        <h3 class="components-menu__title">Компоненты</h3>
        <button class="components-menu__toggle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="components-menu__content">
        <div class="components-menu__search">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Поиск по навыкам и ассистентам" 
            class="components-menu__search-input"
          />
        </div>
        
        <div class="components-menu__list">
          <div class="components-section">
            <div class="components-section__header" @click="toggleSection('assistants')">
              <div class="components-section__title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Мои ассистенты
              </div>
            </div>
            <div class="components-section__content" :class="{ 'components-section__content--expanded': expandedSections.assistants }">
              <div 
                v-for="assistant in filteredAssistants" 
                :key="assistant.id"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, { ...assistant, type: 'assistant' })"
                @dragend="handleDragEnd"
              >
                <div class="component-item__icon">
                  <img :src="assistant.avatar" alt="Avatar" class="component-item__avatar" />
                </div>
                <div class="component-item__info">
                  <div class="component-item__name">{{ assistant.name }}</div>
                  <div class="component-item__description">{{ assistant.role }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="components-section">
            <div class="components-section__header" @click="toggleSection('skills')">
              <div class="components-section__title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Навыки
              </div>
            </div>
            <div class="components-section__content" :class="{ 'components-section__content--expanded': expandedSections.skills }">
              <div 
                v-for="component in filteredComponents" 
                :key="component.id"
                class="component-item"
                draggable="true"
                @dragstart="handleDragStart($event, component)"
                @dragend="handleDragEnd"
              >
                <div class="component-item__icon">
                  <component :is="component.icon" />
                </div>
                <div class="component-item__info">
                  <div class="component-item__name">{{ component.name }}</div>
                  <div class="component-item__description">{{ component.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import SideMenu from '@/components/layout/SideMenu.vue';
import WorkflowConnection from '@/components/WorkflowConnection.vue';
import { IconEdit, IconUpload, IconImage, IconCalendar, IconGoogle, IconJira, IconSlack, IconCondition } from '@/components/icons';

const router = useRouter();
const isComponentsMenuCollapsed = ref(false);
const searchQuery = ref('');
const isDragging = ref(false);
const isPanning = ref(false);
const panPosition = ref({ x: 0, y: 0 });
const startPanPosition = ref({ x: 0, y: 0 });
const scale = ref(1);
const selectedComponents = ref<any[]>([]);
const connectingFrom = ref<any>(null);
const movingComponent = ref<any>(null);
const startDragPosition = ref({ x: 0, y: 0 });
const mousePosition = ref<{ x: number; y: number } | null>(null);
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  componentId: null
});

const assistant = ref({
  name: '',
  role: '',
  description: '',
  language: 'ru'
});

const expandedSections = ref({
  skills: true,
  assistants: true
});

const components = [
  {
    id: 1,
    name: 'Общение',
    description: 'Навыки коммуникации и взаимодействия',
    icon: IconEdit,
    type: 'skill'
  },
  {
    id: 2,
    name: 'Анализ данных',
    description: 'Обработка и анализ информации',
    icon: IconCondition,
    type: 'skill'
  },
  {
    id: 3,
    name: 'Google Workspace',
    description: 'Интеграция с сервисами Google',
    icon: IconGoogle,
    type: 'action'
  },
  {
    id: 4,
    name: 'Jira',
    description: 'Управление задачами и проектами',
    icon: IconJira,
    type: 'action'
  },
  {
    id: 5,
    name: 'Slack',
    description: 'Коммуникация в команде',
    icon: IconSlack,
    type: 'action'
  }
];

const filteredComponents = computed(() => {
  if (!searchQuery.value) return components;
  const query = searchQuery.value.toLowerCase();
  return components.filter(component => 
    component.name.toLowerCase().includes(query) || 
    component.description.toLowerCase().includes(query)
  );
});

const filteredAssistants = computed(() => {
  if (!searchQuery.value) return myAssistants;
  const query = searchQuery.value.toLowerCase();
  return myAssistants.filter(assistant => 
    assistant.name.toLowerCase().includes(query) || 
    assistant.role.toLowerCase().includes(query)
  );
});

const toggleComponentsMenu = () => {
  isComponentsMenuCollapsed.value = !isComponentsMenuCollapsed.value;
};

const selectComponent = (component: any) => {
  console.log('Выбран компонент:', component);
  // TODO: Добавление компонента в ассистента
};

const saveAssistant = () => {
  // TODO: Сохранение ассистента
  console.log('Сохранение ассистента:', assistant.value);
  router.push('/');
};

const handleDragOver = (event: DragEvent) => {
  isDragging.value = true;
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const componentData = JSON.parse(event.dataTransfer?.getData('component') || '{}');
  if (componentData.id && !selectedComponents.value.some(c => c.id === componentData.id)) {
    // Учитываем текущее положение и масштаб при добавлении компонента
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - rect.left - panPosition.value.x) / scale.value;
    const y = (event.clientY - rect.top - panPosition.value.y) / scale.value;
    
    const newComponent = {
      ...componentData,
      connections: [],
      position: {
        x: x - 120,
        y: y - 20
      }
    };

    // Добавляем специальные стили для ассистентов
    if (componentData.type === 'assistant') {
      newComponent.icon = {
        template: `<img src="${componentData.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" />`
      };
    }

    selectedComponents.value.push(newComponent);
  }
};

const handleDragStart = (event: DragEvent, component: any) => {
  event.dataTransfer?.setData('component', JSON.stringify(component));
  isDragging.value = true;
};

const handleDragEnd = () => {
  isDragging.value = false;
};

const removeComponent = (component: any) => {
  selectedComponents.value = selectedComponents.value.filter(c => c.id !== component.id);
};

const startConnection = (component: any, portType: 'input' | 'output') => {
  if (portType === 'output') {
    connectingFrom.value = component;
    const rect = (event?.currentTarget as HTMLElement)?.getBoundingClientRect();
    if (rect) {
      mousePosition.value = {
        x: component.position.x + 240,
        y: component.position.y + 40
      };
    }
  } else if (portType === 'input' && connectingFrom.value) {
    if (connectingFrom.value.id !== component.id) {
      addConnection(connectingFrom.value, component);
    }
    connectingFrom.value = null;
    mousePosition.value = null;
  }
};

const handleComponentClick = (component: any) => {
  if (connectingFrom.value && connectingFrom.value.id !== component.id) {
    addConnection(connectingFrom.value, component);
    connectingFrom.value = null;
    mousePosition.value = null;
  }
};

const addConnection = (fromComponent: any, toComponent: any) => {
  if (!fromComponent.connections) {
    fromComponent.connections = [];
  }
  
  // Проверяем, нет ли уже такого соединения и не является ли это циклическим соединением
  if (!fromComponent.connections.includes(toComponent.id) && !hasCircularConnection(fromComponent, toComponent)) {
    fromComponent.connections.push(toComponent.id);
  }
};

const hasCircularConnection = (fromComponent: any, toComponent: any, visited = new Set()) => {
  if (visited.has(toComponent.id)) {
    return true;
  }
  
  visited.add(toComponent.id);
  
  for (const connectionId of toComponent.connections || []) {
    const nextComponent = selectedComponents.value.find(c => c.id === connectionId);
    if (nextComponent) {
      if (nextComponent.id === fromComponent.id || hasCircularConnection(fromComponent, nextComponent, visited)) {
        return true;
      }
    }
  }
  
  visited.delete(toComponent.id);
  return false;
};

const removeConnection = (fromComponentId: string, toComponentId: string) => {
  const fromComponent = selectedComponents.value.find(c => c.id === fromComponentId);
  if (fromComponent && fromComponent.connections) {
    fromComponent.connections = fromComponent.connections.filter((id: string | number) => id !== toComponentId);
  }
};

const connections = computed(() => {
  const result = [];
  
  for (const component of selectedComponents.value) {
    for (const connectionId of component.connections || []) {
      const targetComponent = selectedComponents.value.find(c => c.id === connectionId);
      if (targetComponent) {
        result.push({
          id: `${component.id}-${connectionId}`,
          startX: component.position.x,
          startY: component.position.y,
          endX: targetComponent.position.x,
          endY: targetComponent.position.y,
          showArrow: true,
          active: connectingFrom.value && connectingFrom.value.id === component.id
        });
      }
    }
  }
  
  // Добавляем временное соединение при перетаскивании
  if (connectingFrom.value && mousePosition.value) {
    result.push({
      id: 'temp',
      startX: connectingFrom.value.position.x,
      startY: connectingFrom.value.position.y,
      endX: mousePosition.value.x,
      endY: mousePosition.value.y,
      showArrow: true,
      active: true
    });
  }
  
  return result;
});

const showContextMenu = (event: MouseEvent, component: any) => {
  event.preventDefault();
  event.stopPropagation();
  
  // Не открываем меню, если компонент перетаскивается
  if (movingComponent.value || isPanning.value) {
    return;
  }
  
  // Если меню уже открыто для этого компонента, закрываем его
  if (contextMenu.value.visible && contextMenu.value.componentId === component.id) {
    closeContextMenu();
    return;
  }
  
  contextMenu.value = {
    visible: true,
    x: 0,
    y: 0,
    componentId: component.id
  };
  
  // Добавляем обработчик клика вне меню для его закрытия
  document.addEventListener('click', closeContextMenu);
  document.addEventListener('contextmenu', closeContextMenu);
};

const closeContextMenu = () => {
  contextMenu.value.visible = false;
  document.removeEventListener('click', closeContextMenu);
  document.removeEventListener('contextmenu', closeContextMenu);
};

const handleMouseDown = (event: MouseEvent) => {
  // Если кликнули на компонент левой кнопкой, начинаем его перемещение
  const componentElement = (event.target as HTMLElement).closest('.workflow-component');
  if (componentElement && event.button === 0) {
    const componentId = componentElement.getAttribute('data-component-id');
    const component = selectedComponents.value.find(c => c.id.toString() === componentId);
    if (component) {
      movingComponent.value = component;
      startDragPosition.value = {
        x: event.clientX - (component.position.x * scale.value + panPosition.value.x),
        y: event.clientY - (component.position.y * scale.value + panPosition.value.y)
      };
      event.preventDefault();
      document.body.style.cursor = 'move';
      return;
    }
  }

  // Если нажата средняя кнопка мыши или левая кнопка на пустом месте
  if (event.button === 1 || (event.button === 0 && event.target === event.currentTarget)) {
    isPanning.value = true;
    startPanPosition.value = {
      x: event.clientX - panPosition.value.x,
      y: event.clientY - panPosition.value.y
    };
    event.preventDefault();
    document.body.style.cursor = 'grabbing';
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (movingComponent.value) {
    const newX = (event.clientX - startDragPosition.value.x - panPosition.value.x) / scale.value;
    const newY = (event.clientY - startDragPosition.value.y - panPosition.value.y) / scale.value;
    
    movingComponent.value.position = {
      x: newX,
      y: newY
    };
    return;
  }

  if (isPanning.value) {
    const newX = event.clientX - startPanPosition.value.x;
    const newY = event.clientY - startPanPosition.value.y;
    
    panPosition.value = {
      x: newX,
      y: newY
    };
  }

  // Обновляем позицию мыши для временного соединения
  if (connectingFrom.value) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (event.clientX - rect.left - panPosition.value.x) / scale.value;
    const y = (event.clientY - rect.top - panPosition.value.y) / scale.value;
    mousePosition.value = { x, y };
  }
};

const handleMouseUp = () => {
  isPanning.value = false;
  movingComponent.value = null;
  connectingFrom.value = null;
  mousePosition.value = null;
  document.body.style.cursor = 'auto';
};

const handleWheel = (event: WheelEvent) => {
  event.preventDefault();
  
  // Получаем размеры и позицию контейнера
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  
  // Позиция курсора относительно контейнера
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  // Позиция курсора в координатах холста до масштабирования
  const pointX = (mouseX - panPosition.value.x) / scale.value;
  const pointY = (mouseY - panPosition.value.y) / scale.value;
  
  // Определяем новый масштаб
  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.min(Math.max(0.1, scale.value * zoomFactor), 5);
  
  if (newScale !== scale.value) {
    // Обновляем масштаб
    scale.value = newScale;
    
    // Вычисляем новую позицию панорамирования, чтобы точка под курсором осталась на месте
    panPosition.value = {
      x: mouseX - pointX * newScale,
      y: mouseY - pointY * newScale
    };
  }
};

const myAssistants = [
  {
    id: 'assistant-1',
    name: 'Алиса',
    role: 'Персональный помощник',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 'assistant-2',
    name: 'Макс',
    role: 'Бизнес-ассистент',
    avatar: 'https://i.pravatar.cc/150?img=2'
  }
];

const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section];
};
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  :deep(.content-wrapper) {
    padding: 0;
    margin: 0;
    max-width: 100%;
    width: 100%;
  }
  
  :deep(.content-wrapper--expanded) {
    padding: 0;
    margin: 0;
    max-width: 100%;
  }
}

.create-assistant {
  flex: 1;
  padding: 0;
  background: #F9FAFB;
  margin: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  position: relative;
  width: 100%;

  &.with-collapsed-menu {
    margin: 0;
  }
}

.components-menu {
  position: fixed;
  right: 0;
  top: 0;
  width: 320px;
  height: 100vh;
  background: #FFFFFF;
  border-left: 1px solid #E5E7EB;
  transition: all 0.3s ease;
  z-index: 10;
  display: flex;
  flex-direction: column;
  
  &--collapsed {
    width: 64px;

    .components-menu__content,
    .components-menu__title {
      display: none;
    }

    .components-menu__toggle {
      transform: rotate(180deg);
    }
  }

  &__header {
    height: 64px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E5E7EB;
    cursor: pointer;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  &__toggle {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #6B7280;
    transition: transform 0.3s ease;

    &:hover {
      color: #111827;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__search {
    padding: 16px;
    border-bottom: 1px solid #E5E7EB;

    &-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #EC4899;
        box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.1);
      }
    }
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.components-layout {
  flex: 1;
  height: 100vh;
  border: none;
  border-radius: 0;
  padding: 0;
  transition: none;
  background-color: #F5F5F5;
  background-image: 
    radial-gradient(circle, #E5E7EB 1px, transparent 1px);
  background-size: 24px 24px;
  position: relative;
  overflow: hidden;
  cursor: grab;

  &--drag-over {
    background: rgba(236, 72, 153, 0.05);
  }

  &:active {
    cursor: grabbing;
  }

  &__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: center center;
    will-change: transform;
    min-width: 100%;
    min-height: 100%;
  }

  &__workflow {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    padding: 0;
  }
}

.workflow-component {
  position: absolute;
  padding: 0;
  background: transparent;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  cursor: move;
  width: 240px;
  transform-origin: center center;
  user-select: none;
  will-change: transform;

  &:active {
    cursor: move;
    z-index: 10;
  }

  &--skill {
    width: 56px;

    .workflow-component__header {
      min-height: 56px;
      padding: 8px;
      flex-direction: column;
      gap: 0;
    }

    .workflow-component__icon {
      width: 40px;
      height: 40px;
    }
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    position: relative;
    min-height: 64px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    &:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  }

  &__icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F3F4F6;
    border-radius: 8px;
    color: #6B7280;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    text-align: left;
  }

  &__description {
    font-size: 12px;
    color: #6B7280;
    margin-top: 2px;
  }

  &__ports {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;

    .port {
      position: absolute;
      width: 14px;
      height: 14px;
      background: #6B7280;
      transition: all 0.2s ease;
      pointer-events: auto;
      cursor: crosshair;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 0 2px #6B7280;
      z-index: 2;

      &--input {
        top: 32px;
        left: -8px;
        transform: translateY(0);
        border-radius: 2px;
      }

      &--output {
        top: 32px;
        right: -8px;
        transform: translateY(0);
        border-radius: 50%;
      }

      &:hover {
        transform: scale(1.2);
        box-shadow: 0 0 0 2px #EC4899;
        background: #EC4899;
      }
    }
  }

  &__context-menu {
    position: absolute;
    background: #FFFFFF;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #E5E7EB;
    z-index: 100;
    min-width: 160px;
    top: 32px;
    left: 50%;
    transform: translateX(-50%);
    transform-origin: top center;
    animation: menuAppear 0.2s ease;
    
    @keyframes menuAppear {
      from {
        opacity: 0;
        transform: translateX(-50%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) scale(1);
      }
    }
    
    &-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      font-size: 14px;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 4px;
      margin: 2px;

      svg {
        color: #6B7280;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      &:hover {
        background: #F3F4F6;
      }

      &--delete {
        color: #EF4444;
        
        svg {
          color: #EF4444;
        }

        &:hover {
          background: #FEE2E2;
        }
      }
    }
  }
}

.workflow-connection {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: visible;

  path {
    stroke: #9CA3AF;
    stroke-width: 2;
    fill: none;
    transition: all 0.3s ease;
    pointer-events: auto;
    cursor: pointer;
    
    &:hover {
      stroke: #EC4899;
    }
  }

  &--active {
    path {
      stroke: #EC4899;
    }
  }
}

.component-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F3F4F6;
  }

  &__icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F3F4F6;
    border-radius: 8px;
    color: #6B7280;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    flex: 1;
  }

  &__name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }

  &__description {
    font-size: 12px;
    color: #6B7280;
    margin-top: 2px;
  }
}

.components-section {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    cursor: pointer;
    user-select: none;
    color: #374151;
    font-weight: 500;
    font-size: 14px;

    &:hover {
      color: #111827;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__toggle {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__content {
    display: none;
    padding-top: 8px;

    &--expanded {
      display: block;
    }
  }
}
</style>