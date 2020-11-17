import { ListAccessArgs } from './types';

/*
  The basic level of access to the system is being signed in as a valid user. This gives you access
  to the Admin UI, access to your own User and Todo items, and read access to roles.
*/
export const isSignedIn = ({ session }: ListAccessArgs) => {
  return !!session;
};

/*
  Permissions are shorthand functions for checking that the current user's role has the specified
  permission boolean set to true
*/
export const permissions = {
  can(permission) {
    return () => true;
    return function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[`can${permission}`];
    };
  },
  // canCreateTodos: ({ session }: ListAccessArgs) => !!session?.data.role?.canCreateTodos,
  // canManageAllTodos: ({ session }: ListAccessArgs) => !!session?.data.role?.canManageAllTodos,
  // canManageUsers: ({ session }: ListAccessArgs) => !!session?.data.role?.canManageUsers,
  // canManageRoles: ({ session }: ListAccessArgs) => !!session?.data.role?.canManageRoles,
};

/*
  Rules are logical functions that can be used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items
*/
export const rules = {
  canReadTodos: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No todos.
      return false;
    } else if (session.data.role?.canManageAllTodos) {
      // Can see all todos that are: assigned to them, or not private
      return {
        OR: [
          { assignedTo: { id: session.itemId } },
          { assignedTo_is_null: true, isPrivate: true },
          { isPrivate_not: true },
        ],
      };
    } else {
      // Can only see their own todos
      return { assignedTo: { id: session.itemId } };
    }
  },
  canManageProducts: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No Products
      return false;
    } else if (session.data.role?.canManageAllProducts) {
      // Can manage products? go for it
      return true;
    } else {
      // Can only manage their own products
      return { author: { id: session.itemId } };
    }
  },
  canReadUsers: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No people.
      return false;
    } else if (session.data.role?.canSeeOtherPeople) {
      // Can see everyone
      return true;
    } else {
      // Can only see yourself
      return { id: session.itemId };
    }
  },
  canUpdateUsers: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No people.
      return false;
    } else if (session.data.role?.canEditOtherPeople) {
      // Can update everyone
      return true;
    } else {
      // Can update yourself
      return { id: session.itemId };
    }
  },
};
