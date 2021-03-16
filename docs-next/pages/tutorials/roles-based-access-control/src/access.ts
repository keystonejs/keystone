import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs) {
  return !!session?.data;
}

export const permissions = {
  canManageUsers: ({ session }: ListAccessArgs) => !!session?.data.role?.canManageUsers,
  canManageRoles: ({ session }: ListAccessArgs) => !!session?.data.role?.canManageRoles,
  canCreatePosts: ({ session }: ListAccessArgs) => !!session?.data.role?.canCreatePosts,
  canUpdatePosts: ({ session }: ListAccessArgs) =>
    !!session?.data.role?.canUpdatePosts || { author: { id: session?.itemId } },
  canDeletePosts: ({ session }: ListAccessArgs) =>
    !!session?.data.role?.canDeletePosts || { author: { id: session?.itemId } },
};
