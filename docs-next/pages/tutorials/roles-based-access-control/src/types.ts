export type Session = {
  itemId: string;
  listKey: string;
  data: {
    name: string;
    role?: {
      id: string;
      name: string;
      canManageUsers: boolean;
      canManageRoles: boolean;
      canCreatePosts: boolean;
      canUpdatePosts: boolean;
      canDeletePosts: boolean;
    };
  };
};

export type ListAccessArgs = {
  itemId?: string;
  session?: Session;
};
