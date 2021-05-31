export type Session = {
  itemId: string;
  listKey: string;
  data: {
    name: string;
    role?: {
      id: string;
      name: string;
      canCreateTodos: boolean;
      canManageAllTodos: boolean;
      canSeeOtherPeople: boolean;
      canEditOtherPeople: boolean;
      canManagePeople: boolean;
      canManageRoles: boolean;
    };
  };
};

export type ListAccessArgs = {
  session?: Session;
};
