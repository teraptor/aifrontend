import { Role, Permission } from '../types';

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Администратор',
    description: 'Полный доступ ко всем ресурсам',
    permissions: []
  },
  {
    id: 'user',
    name: 'Пользователь',
    description: 'Базовый доступ к ресурсам',
    permissions: []
  },
  {
    id: 'guest',
    name: 'Гость',
    description: 'Ограниченный доступ к ресурсам',
    permissions: []
  }
];

export const DEFAULT_PERMISSIONS: Permission[] = [
  {
    id: 'read:users',
    name: 'Чтение пользователей',
    resource: 'users',
    action: 'read',
    description: 'Просмотр списка пользователей'
  },
  {
    id: 'write:users',
    name: 'Редактирование пользователей',
    resource: 'users',
    action: 'write',
    description: 'Создание и редактирование пользователей'
  },
  {
    id: 'delete:users',
    name: 'Удаление пользователей',
    resource: 'users',
    action: 'delete',
    description: 'Удаление пользователей'
  },
  {
    id: 'read:roles',
    name: 'Чтение ролей',
    resource: 'roles',
    action: 'read',
    description: 'Просмотр списка ролей'
  },
  {
    id: 'write:roles',
    name: 'Редактирование ролей',
    resource: 'roles',
    action: 'write',
    description: 'Создание и редактирование ролей'
  }
];

export const RESOURCES = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions'
} as const;

export const ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE: 'manage'
} as const; 