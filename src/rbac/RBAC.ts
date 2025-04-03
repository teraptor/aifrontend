import { Role, Permission, UserRole, RolePermission } from './types';
import { DEFAULT_ROLES, DEFAULT_PERMISSIONS } from './constants';
import { RBACUtils } from './utils';

export class RBAC {
  private roles: Map<string, Role>;
  private permissions: Map<string, Permission>;
  private userRoles: Map<string, Set<string>>;
  private rolePermissions: Map<string, Set<string>>;

  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.userRoles = new Map();
    this.rolePermissions = new Map();

    // Инициализация дефолтных ролей и разрешений
    this.initializeDefaultRoles();
    this.initializeDefaultPermissions();
  }

  private initializeDefaultRoles(): void {
    DEFAULT_ROLES.forEach((role) => {
      this.addRole(role);
    });
  }

  private initializeDefaultPermissions(): void {
    DEFAULT_PERMISSIONS.forEach((permission) => {
      this.addPermission(permission);
    });
  }

  addRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  addPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
  }

  assignRoleToUser(userId: string, roleId: string): void {
    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }
    this.userRoles.get(userId)?.add(roleId);
  }

  removeRoleFromUser(userId: string, roleId: string): void {
    this.userRoles.get(userId)?.delete(roleId);
  }

  assignPermissionToRole(roleId: string, permissionId: string): void {
    if (!this.rolePermissions.has(roleId)) {
      this.rolePermissions.set(roleId, new Set());
    }
    this.rolePermissions.get(roleId)?.add(permissionId);
  }

  removePermissionFromRole(roleId: string, permissionId: string): void {
    this.rolePermissions.get(roleId)?.delete(permissionId);
  }

  getUserRoles(userId: string): Role[] {
    const roleIds = this.userRoles.get(userId);
    if (!roleIds) return [];

    return Array.from(roleIds)
      .map((roleId) => this.roles.get(roleId))
      .filter((role): role is Role => role !== undefined);
  }

  getUserPermissions(userId: string): Permission[] {
    const userRoles = this.getUserRoles(userId);
    const permissions: Permission[] = [];

    userRoles.forEach((role) => {
      const rolePermissionIds = this.rolePermissions.get(role.id);
      if (rolePermissionIds) {
        rolePermissionIds.forEach((permissionId) => {
          const permission = this.permissions.get(permissionId);
          if (permission) {
            permissions.push(permission);
          }
        });
      }
    });

    return RBACUtils.mergePermissions(permissions, []);
  }

  hasPermission(userId: string, permission: Permission): boolean {
    const userPermissions = this.getUserPermissions(userId);
    return RBACUtils.hasPermission(userPermissions, permission);
  }

  checkAccess(userId: string, requiredPermissions: Permission[]): boolean {
    const userPermissions = this.getUserPermissions(userId);
    const result = RBACUtils.checkAccess(userPermissions, requiredPermissions);
    return result.hasAccess;
  }

  hasResourceAccess(userId: string, resource: string, action: string): boolean {
    const userPermissions = this.getUserPermissions(userId);
    return RBACUtils.hasResourceAccess(userPermissions, resource, action);
  }

  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId);
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }
} 