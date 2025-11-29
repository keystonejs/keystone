import { config, list } from '@keystone-6/core'
import { createRBAC, createRole, createPermission } from '@keystone-6/core'
import { text, select, relationship, integer, password } from '@keystone-6/core/fields'
import { statelessSessions } from '@keystone-6/core/session'

// 定义RBAC配置
const rbac = createRBAC({
  permissions: {
    // Post权限
    'post:read': createPermission('post:read', 'read', { list: 'Post' }),
    'post:create': createPermission('post:create', 'create', { list: 'Post' }),
    'post:update': createPermission('post:update', 'update', { list: 'Post' }),
    'post:delete': createPermission('post:delete', 'delete', { list: 'Post' }),
    'post:update-status': createPermission('post:update-status', 'update', { list: 'Post', field: 'status' }),
    
    // User权限
    'user:read': createPermission('user:read', 'read', { list: 'User' }),
    'user:create': createPermission('user:create', 'create', { list: 'User' }),
    'user:update': createPermission('user:update', 'update', { list: 'User' }),
    'user:delete': createPermission('user:delete', 'delete', { list: 'User' }),
    
    // Category权限
    'category:read': createPermission('category:read', 'read', { list: 'Category' }),
    'category:create': createPermission('category:create', 'create', { list: 'Category' }),
    'category:update': createPermission('category:update', 'update', { list: 'Category' }),
    'category:delete': createPermission('category:delete', 'delete', { list: 'Category' }),
  },
  roles: {
    'viewer': createRole('viewer', ['post:read', 'user:read', 'category:read']),
    'editor': createRole('editor', ['post:create', 'post:update', 'post:update-status', 'category:create', 'category:update'], ['viewer']),
    'admin': createRole('admin', ['post:delete', 'user:create', 'user:update', 'user:delete', 'category:delete'], ['editor']),
  },
  getRoles: (session: any) => {
    // 从session中获取用户角色
    return session?.data?.roles?.split(',') || []
  }
})

// 配置会话
const session = statelessSessions({
  maxAge: 60 * 60 * 24 * 30, // 30 days
  secret: 'my-super-secret-key-123-which-is-at-least-32-characters-long',
})

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./keystone.db',
  },
  session,
  lists: {
    Post: list({
      access: rbac.listAccessControl(),
      fields: {
        title: text({ validation: { isRequired: true } }),
        content: text(),
        status: select({
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
          access: rbac.fieldAccessControl('status'),
        }),
        author: relationship({ ref: 'User.posts' }),
        category: relationship({ ref: 'Category.posts' }),
        views: integer({ defaultValue: 0 }),
      },
    }),
    User: list({
      access: rbac.listAccessControl(),
      fields: {
        name: text({ validation: { isRequired: true } }),
        email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
        password: password({ validation: { isRequired: true } }),
        roles: text({ 
          defaultValue: 'viewer',
          access: rbac.fieldAccessControl('roles'),
        }),
        posts: relationship({ ref: 'Post.author', many: true }),
      },
    }),
    Category: list({
      access: rbac.listAccessControl(),
      fields: {
        name: text({ validation: { isRequired: true } }),
        posts: relationship({ ref: 'Post.category', many: true }),
      },
    }),
  },
})
