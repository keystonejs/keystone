# Keystone 6 RBAC 示例

这个示例展示了如何在Keystone 6中使用新的RBAC（基于角色的访问控制）功能。

## 功能特点

- 角色定义和权限分配
- 权限继承
- 字段级权限控制
- 动态权限规则

## 安装和运行

```bash
cd examples/usecase-rbac
npm install
npm run dev
```

## 配置RBAC

在`keystone.ts`文件中，我们定义了RBAC配置：

```typescript
import { createRBAC, createRole, createPermission } from '@keystone-6/core'

const rbac = createRBAC({
  permissions: {
    'post:read': createPermission('post:read', 'read', { list: 'Post' }),
    'post:create': createPermission('post:create', 'create', { list: 'Post' }),
    'post:update': createPermission('post:update', 'update', { list: 'Post' }),
    'post:delete': createPermission('post:delete', 'delete', { list: 'Post' }),
    'post:update-status': createPermission('post:update-status', 'update', { list: 'Post', field: 'status' }),
    'user:read': createPermission('user:read', 'read', { list: 'User' }),
    'user:create': createPermission('user:create', 'create', { list: 'User' }),
    'user:update': createPermission('user:update', 'update', { list: 'User' }),
    'user:delete': createPermission('user:delete', 'delete', { list: 'User' }),
  },
  roles: {
    'viewer': createRole('viewer', ['post:read', 'user:read']),
    'editor': createRole('editor', ['post:create', 'post:update', 'post:update-status'], ['viewer']),
    'admin': createRole('admin', ['post:delete', 'user:create', 'user:update', 'user:delete'], ['editor']),
  },
  getRoles: (session: any) => {
    // 从session中获取用户角色
    return session?.data?.roles || []
  }
})
```

## 在列表中使用RBAC

```typescript
const Post = list({
  access: rbac.listAccessControl(),
  fields: {
    title: text(),
    content: text(),
    status: select({
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
    }),
    author: relationship({ ref: 'User.posts' }),
  },
})
```

## 字段级权限

```typescript
const User = list({
  access: rbac.listAccessControl(),
  fields: {
    name: text(),
    email: text(),
    roles: text({
      // 只有admin可以修改角色字段
      access: rbac.fieldAccessControl('roles'),
    }),
    posts: relationship({ ref: 'Post.author', many: true }),
  },
})
```
