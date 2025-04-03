export type Role = {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
};

export type Permission = {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
};

export type UserRole = {
  userId: string;
  roleId: string;
};

export type RolePermission = {
  roleId: string;
  permissionId: string;
};

export type AccessCheckResult = {
  hasAccess: boolean;
  missingPermissions?: Permission[];
}; 