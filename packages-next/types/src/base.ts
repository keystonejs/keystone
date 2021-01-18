import type { KeystoneContext } from './core';
import type { BaseGeneratedListTypes, GqlNames } from './utils';

// TODO: This is only a partial typing of the core Keystone class.
// We should definitely invest some time into making this more correct.
export type BaseKeystone = {
  adapters: Record<string, any>;
  createList: (
    key: string,
    config: {
      fields: Record<string, any>;
      access: any;
      queryLimits?: { maxResults?: number };
      schemaDoc?: string;
      listQueryName?: string;
      itemQueryName?: string;
      hooks?: Record<string, any>;
    }
  ) => BaseKeystoneList;
  connect: (args?: any) => Promise<void>;
  disconnect: () => Promise<void>;
  lists: Record<string, BaseKeystoneList>;
  createApolloServer: (args: { schemaName: string; dev: boolean }) => any;
  getTypeDefs: (args: { schemaName: string }) => any;
  getResolvers: (args: { schemaName: string }) => any;
  queryLimits: { maxTotalResults: number };
  _consolidateRelationships: () => Record<string, any>[];
};

// TODO: This needs to be reviewed and expanded
export type BaseKeystoneList = {
  key: string;
  fieldsByPath: Record<string, BaseKeystoneField>;
  fields: BaseKeystoneField[];
  adapter: { itemsQuery: (args: Record<string, any>, extra: Record<string, any>) => any };
  adminUILabels: {
    label: string;
    singular: string;
    plural: string;
    path: string;
  };
  gqlNames: GqlNames;
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
};

type BaseKeystoneField = {
  gqlCreateInputFields: (arg: { schemaName: string }) => void;
  getBackingTypes: () => Record<string, { optional: true; type: 'string | null' }>;
  label: string;
  isOrderable: boolean;
};
