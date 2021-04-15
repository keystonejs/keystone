import { PrismaAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields';
import { Relationship } from '@keystone-next/fields/src/types/relationship/Implementation';
import { DocumentNode } from 'graphql';
import type { KeystoneContext } from './context';
import type { BaseGeneratedListTypes, GqlNames } from './utils';

export type Rel = {
  left: Relationship<any>;
  right?: Relationship<any>;
  cardinality?: 'N:N' | 'N:1' | '1:N' | '1:1';
  tableName?: string;
  columnName?: string;
  columnNames?: Record<string, { near: string; far: string }>;
};

export type BaseListConfig = {
  fields: Record<string, any>;
  access: any;
  queryLimits?: { maxResults?: number };
  schemaDoc?: string;
  listQueryName?: string;
  itemQueryName?: string;
  hooks?: Record<string, any>;
  adapterConfig?: { searchField?: string };
};

// TODO: This is only a partial typing of the core Keystone class.
// We should definitely invest some time into making this more correct.
export type BaseKeystone = {
  lists: Record<string, BaseKeystoneList>;
  listsArray: BaseKeystoneList[];
  getListByKey: (key: string) => BaseKeystoneList | undefined;
  onConnect: (keystone: BaseKeystone, args?: { context: KeystoneContext }) => Promise<void>;
  _listCRUDProvider: any;
  _providers: any[];
  adapter: PrismaAdapter;
  queryLimits: { maxTotalResults: number };

  createList: (key: string, config: BaseListConfig) => BaseKeystoneList;
  _consolidateRelationships: () => Rel[];
  connect: (args?: { context: KeystoneContext }) => Promise<void>;
  disconnect: () => Promise<void>;
  getTypeDefs: (args: { schemaName: string }) => DocumentNode[];
  getResolvers: (args: { schemaName: string }) => Record<string, any>;
};

// TODO: This needs to be reviewed and expanded
export type BaseKeystoneList = {
  key: string;
  fieldsByPath: Record<string, Implementation<any>>;
  fields: Implementation<any>[];
  adapter: PrismaListAdapter;
  access: Record<string, any>;
  adminUILabels: {
    label: string;
    singular: string;
    plural: string;
    path: string;
  };
  gqlNames: GqlNames;
  initFields: () => {};
  listQuery(
    args: BaseGeneratedListTypes['args']['listQuery'],
    context: KeystoneContext,
    gqlName?: string,
    info?: any,
    from?: any
  ): Promise<Record<string, any>[]>;
  listQueryMeta(
    args: BaseGeneratedListTypes['args']['listQuery'],
    context: KeystoneContext,
    gqlName?: string,
    info?: any,
    from?: any
  ): {
    getCount: () => Promise<number>;
  };
  itemQuery(
    args: { where: { id: string } },
    context: KeystoneContext,
    gqlName?: string,
    info?: any
  ): Promise<Record<string, any>>;
  createMutation(
    data: Record<string, any>,
    context: KeystoneContext,
    mutationState?: any
  ): Promise<Record<string, any>>;
  createManyMutation(
    data: Record<string, any>[],
    context: KeystoneContext,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
  updateMutation(
    id: string,
    data: Record<string, any>,
    context: KeystoneContext,
    mutationState?: any
  ): Promise<Record<string, any>>;
  updateManyMutation(
    data: Record<string, any>,
    context: KeystoneContext,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
  deleteMutation(
    id: string,
    context: KeystoneContext,
    mutationState?: any
  ): Promise<Record<string, any>>;
  deleteManyMutation(
    ids: string[],
    context: KeystoneContext,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
  getGraphqlFilterFragment: () => string[];
};
