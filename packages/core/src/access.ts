import type { MaybePromise } from './types/utils'
import type { BaseListTypeInfo } from './types'
import type {
  RBACConfig,
  Role,
  Permission,
  RoleName,
  PermissionName,
  PermissionAction,
  PermissionResource
} from './access-rbac'
import { createRBAC, createRole, createPermission, RBAC } from './access-rbac'

export function allowAll() {
  return true
}

export function denyAll() {
  return false
}

export function unfiltered<ListTypeInfo extends BaseListTypeInfo>(): MaybePromise<
  boolean | ListTypeInfo['inputs']['where']
> {
  return true
}

export function allOperations<F>(f: F) {
  return {
    query: f,
    create: f,
    update: f,
    delete: f,
  }
}

// RBAC相关导出
export {
  createRBAC,
  createRole,
  createPermission,
  RBAC
}

export type {
  RBACConfig,
  Role,
  Permission,
  RoleName,
  PermissionName,
  PermissionAction,
  PermissionResource
}
