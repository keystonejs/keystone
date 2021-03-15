// NOTE -- these types are commented out in master because they aren't generated by the build (yet)
// To get full List and GraphQL API type support, uncomment them here and use them below

// import { KeystoneGraphQLAPI, KeystoneListsAPI } from '@keystone-next/types';
// import type { KeystoneListsTypeInfo } from './.keystone/schema-types';

// export type ListsAPI = KeystoneListsAPI<KeystoneListsTypeInfo>;
// export type GraphqlAPI = KeystoneGraphQLAPI<KeystoneListsTypeInfo>;

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
  itemId?: string;
  session?: Session;
};
