import type { MaybePromise } from './types/utils'
import type { BaseListTypeInfo, KeystoneContext } from './types'
import type {
  ListAccessControl,
  FieldAccessControl,
  BaseAccessArgs,
  AccessOperation,
  FilterOperation,
  ItemOperation
} from './types/config/access-control'

// RBAC类型定义
export type RoleName = string
export type PermissionName = string
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'all'
export type PermissionResource = { list: string; field?: string }

export type Permission = {
  name: PermissionName
  action: PermissionAction
  resource: PermissionResource
}

export type Role = {
  name: RoleName
  permissions: PermissionName[]
  inheritedRoles?: RoleName[]
}

export type RBACConfig = {
  roles: Record<RoleName, Role>
  permissions: Record<PermissionName, Permission>
  getRoles: (session?: any) => MaybePromise<RoleName[]>
}

// RBAC权限检查器
export class RBAC {
  private roles: Record<RoleName, Role>
  private permissions: Record<PermissionName, Permission>
  private getRoles: (session?: any) => MaybePromise<RoleName[]>

  constructor(config: RBACConfig) {
    this.roles = config.roles
    this.permissions = config.permissions
    this.getRoles = config.getRoles
  }

  // 获取角色的所有权限（包括继承的）
  private async getAllPermissionsForRoles(roles: RoleName[]): Promise<Permission[]> {
    const permissions = new Set<Permission>()

    // 递归获取角色及其继承角色的权限
    const getRolePermissions = async (roleName: RoleName) => {
      const role = this.roles[roleName]
      if (!role) return

      // 添加当前角色的权限
      role.permissions.forEach(permName => {
        const perm = this.permissions[permName]
        if (perm) permissions.add(perm)
      })

      // 递归处理继承的角色
      if (role.inheritedRoles) {
        for (const inheritedRole of role.inheritedRoles) {
          await getRolePermissions(inheritedRole)
        }
      }
    }

    // 处理所有角色
    for (const roleName of roles) {
      await getRolePermissions(roleName)
    }

    return Array.from(permissions)
  }

  // 检查是否有权限执行操作
  private async hasPermission(
    session: any,
    listKey: string,
    operation: AccessOperation,
    fieldKey?: string
  ): Promise<boolean> {
    // 获取用户的角色
    const roles = await this.getRoles(session)
    if (!roles || roles.length === 0) return false

    // 获取所有权限
    const permissions = await this.getAllPermissionsForRoles(roles)

    // 检查权限是否匹配
    return permissions.some(perm => {
      // 检查资源是否匹配
      if (perm.resource.list !== listKey) return false
      if (fieldKey && perm.resource.field && perm.resource.field !== fieldKey) return false

      // 检查操作是否匹配
      if (perm.action === 'all') return true
      if (perm.action === operation) return true

      return false
    })
  }

  // 创建列表级访问控制函数
  public listAccessControl(): ListAccessControl<BaseListTypeInfo> {
    return async (args: BaseAccessArgs<BaseListTypeInfo> & { operation: AccessOperation }) => {
      return this.hasPermission(args.session, args.listKey, args.operation)
    }
  }

  // 创建字段级访问控制函数
  public fieldAccessControl(fieldKey: string): FieldAccessControl<BaseListTypeInfo> {
    return async (args: any) => {
      // 处理不同的操作类型
      const operation = args.operation
      const listKey = args.listKey
      const session = args.session

      return this.hasPermission(session, listKey, operation as AccessOperation, fieldKey)
    }
  }
}

// RBAC构建器函数
export function createRBAC(config: RBACConfig) {
  return new RBAC(config)
}

// 权限快捷创建函数
export function createPermission(
  name: PermissionName,
  action: PermissionAction,
  resource: PermissionResource
): Permission {
  return { name, action, resource }
}

// 角色快捷创建函数
export function createRole(
  name: RoleName,
  permissions: PermissionName[],
  inheritedRoles?: RoleName[]
): Role {
  return { name, permissions, inheritedRoles }
}
