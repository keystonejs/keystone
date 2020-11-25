import { permissionsList } from './schemas/fields';
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
const generatedPermissions = Object.fromEntries(
  permissionsList.map(permission => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
);

export const permissions = {
  // We create a permission for each can* field on the Role type
  ...generatedPermissions,
  // we can also add additional permissions as we need them
  isAwesome({ session }: ListAccessArgs) {
    if (session?.data.name?.includes('wes') || session?.data.name?.includes('jed')) {
      // they are awesome, let them have access
      return true;
    }
    return false; // not awesome, no access
  },
};

/*
  Rules are logical functions that can be used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items
*/
export const rules = {
  canOrder: ({ session }: ListAccessArgs) => {
    if (!session) return false; // not signed in
    if (permissions.canManageCart(session)) return true; // if they have the permission
    // otherwise we only show them cart items that they own
    return {
      user: { id: session.itemId },
    };
  },
  canReadUsers: ({ session }: ListAccessArgs) => {
    if (!session) {
      // No session? No people.
      return false;
    } else if (session.data.role?.canSeeOtherUsers) {
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
    } else if (session.data.role?.canManageUsers) {
      // Can update everyone
      return true;
    } else {
      // Can update yourself
      return { id: session.itemId };
    }
  },
  canReadProducts: ({ session }: ListAccessArgs) => {
    if (session?.data.role?.canManageProducts) {
      return true;
    } else {
      return { status: 'AVAILABLE' };
    }
  },
};
