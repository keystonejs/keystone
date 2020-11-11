import { KeystoneGraphQLAPI, KeystoneListsAPI } from '@keystone-next/types';

import type { KeystoneListsTypeInfo } from './.keystone/schema-types';

export type Session = {
  itemId?: string;
  listKey?: string;
  data?: {
    name?: string;
    permissions: 'USER' | 'EDITOR' | 'ADMIN';
  };
};

export type ListsAPI = KeystoneListsAPI<KeystoneListsTypeInfo>;
export type GraphqlAPI = KeystoneGraphQLAPI<KeystoneListsTypeInfo>;

export type AccessArgs = {
  session?: Session;
  item?: any;
};

export type AccessControl = {
  [key: string]: (args: AccessArgs) => any;
};
