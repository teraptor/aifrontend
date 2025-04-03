import { Role, Permission, AccessCheckResult } from '../types';
import { RESOURCES, ACTIONS } from '../constants';

export class RBACUtils {
  static hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
    return userPermissions.some(
      (permission) =>
        permission.resource === requiredPermission.resource &&
        permission.action === requiredPermission.action
    );
  }

  static checkAccess(
    userPermissions: Permission[],
    requiredPermissions: Permission[]
  ): AccessCheckResult {
    const missingPermissions: Permission[] = [];

    for (const requiredPermission of requiredPermissions) {
      if (!this.hasPermission(userPermissions, requiredPermission)) {
        missingPermissions.push(requiredPermission);
      }
    }

    return {
      hasAccess: missingPermissions.length === 0,
      missingPermissions: missingPermissions.length > 0 ? missingPermissions : undefined
    };
  }

  static createPermission(resource: string, action: string, name: string): Permission {
    return {
      id: `${action}:${resource}`,
      name,
      resource,
      action
    };
  }

  static getResourcePermissions(resource: string): Permission[] {
    return Object.values(ACTIONS).map((action) => ({
      id: `${action}:${resource}`,
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
      resource,
      action
    }));
  }

  static mergePermissions(permissions1: Permission[], permissions2: Permission[]): Permission[] {
    const merged = new Map<string, Permission>();

    [...permissions1, ...permissions2].forEach((permission) => {
      merged.set(permission.id, permission);
    });

    return Array.from(merged.values());
  }

  static getRolePermissions(role: Role): Permission[] {
    return role.permissions;
  }

  static hasResourceAccess(
    userPermissions: Permission[],
    resource: string,
    action: string
  ): boolean {
    return userPermissions.some(
      (permission) => permission.resource === resource && permission.action === action
    );
  }
} 