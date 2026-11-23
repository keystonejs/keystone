import type { Session } from './generated/keystone/types'

declare module './generated/keystone/types' {
  export interface Session {
    user: Lists.User.Item
    role: Lists.Role.Item | null
  }
}

type AccessArgs = {
  session?: Session
}

// this function checks only that a session actually exists, nothing else
export function isSignedIn({ session }: AccessArgs) {
  return Boolean(session)
}

/*
  Permissions are shorthand functions for checking that the current user's role has the specified
  permission boolean set to true
*/
export const permissions = {
  canCreateTodos: ({ session }: AccessArgs) => session?.role?.canCreateTodos ?? false,
  canManageAllTodos: ({ session }: AccessArgs) => session?.role?.canManageAllTodos ?? false,
  canManagePeople: ({ session }: AccessArgs) => session?.role?.canManagePeople ?? false,
  canManageRoles: ({ session }: AccessArgs) => session?.role?.canManageRoles ?? false,
  // TODO: add canViewAdminUI
}

/*
  Rules are logical functions that can be used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items
*/
export const rules = {
  canReadTodos: ({ session }: AccessArgs) => {
    if (!session) return false

    if (session.role?.canManageAllTodos) {
      // can see all todos that are: assigned to them, or not private
      return {
        OR: [
          { assignedTo: { id: { equals: session.user.id } } },
          { assignedTo: null, isPrivate: { equals: true } },
          { NOT: { isPrivate: { equals: true } } },
        ],
      }
    }

    // default to only seeing your own todos
    return { assignedTo: { id: { equals: session.user.id } } }
  },
  canManageTodos: ({ session }: AccessArgs) => {
    if (!session) return false

    // can manage every todo?
    if (session.role?.canManageAllTodos) return true

    // default to only managing your own todos
    return { assignedTo: { id: { equals: session.user.id } } }
  },
  canReadPeople: ({ session }: AccessArgs) => {
    if (!session) return false

    // can see everyone?
    if (session.role?.canSeeOtherPeople) return true

    // default to only seeing yourself
    return { id: { equals: session.user.id } }
  },
  canUpdatePeople: ({ session }: AccessArgs) => {
    if (!session) return false

    // can update everyone?
    if (session.role?.canEditOtherPeople) return true

    // default to only updating yourself
    return { id: { equals: session.user.id } }
  },
}
