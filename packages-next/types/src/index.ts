import type { ComponentType, ReactElement } from 'react';
import type { FieldAccessControl } from './schema/access-control';
import type { BaseGeneratedListTypes, JSONValue, GqlNames, MaybePromise } from './utils';
import type { ListHooks } from './schema/hooks';
import { SessionStrategy } from './session';
import { SchemaConfig } from './schema';
import { IncomingMessage, ServerResponse } from 'http';
import { GraphQLSchema } from 'graphql';
export * from './schema';
export * from './utils';
export * from './session';

export type { ListHooks };

export type AdminFileToWrite =
  | {
      mode: 'write';
      src: string;
      outputPath: string;
    }
  | {
      mode: 'copy';
      inputPath: string;
      outputPath: string;
    };

export type KeystoneAdminConfig = {
  /** Enables certain functionality in the Admin UI that expects the session to be an item */
  enableSessionItem?: boolean;
  /** A function that can be run to validate that the current session should have access to the Admin UI */
  isAccessAllowed?: (args: { session: any }) => MaybePromise<boolean>;
  /** An array of page routes that can be accessed without passing the isAccessAllowed check */
  publicPages?: string[];
  /** The basePath for the Admin UI App */
  path?: string;
  getAdditionalFiles?: ((keystone: Keystone) => MaybePromise<AdminFileToWrite[]>)[];
  pageMiddleware?: (args: {
    req: IncomingMessage;
    session: any;
    isValidSession: boolean;
    keystone: Keystone;
  }) => MaybePromise<{ kind: 'redirect'; to: string } | void>;
};

export type KeystoneConfig = {
  name: string;
  db: {
    adapter: 'mongoose' | 'knex';
    url: string;
  };
  graphql?: {
    path?: string;
    queryLimits?: {
      maxTotalResults?: number;
    };
  };
  session?: () => SessionStrategy<any>;
  admin?: KeystoneAdminConfig;
} & SchemaConfig;

export type CellComponent = {
  (props: {
    item: Record<string, any>;
    path: string;
    linkTo: { href: string; as: string } | undefined;
  }): ReactElement;

  supportsLinkTo?: boolean;
};

export type MaybeItemFunction<T> =
  | T
  | ((args: {
      session: any;
      item: { id: string | number; [path: string]: any };
    }) => MaybePromise<T>);
export type MaybeSessionFunction<T> = T | ((args: { session: any }) => MaybePromise<T>);

export type FieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  hooks?: ListHooks<TGeneratedListTypes>;
  access?: FieldAccessControl<TGeneratedListTypes>;
  admin?: {
    views?: string;
    description?: string;
    createView?: {
      fieldMode?: MaybeSessionFunction<'edit' | 'hidden'>;
    };
    listView?: {
      fieldMode?: MaybeSessionFunction<'read' | 'hidden'>;
    };
    itemView?: {
      fieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden'>;
    };
  };
};

export type FieldType<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  /**
   * The real keystone type for the field
   */
  type: any;
  /**
   * The config for the field
   */
  config: FieldConfig<TGeneratedListTypes>;
  /**
   * The resolved path to the views for the field type
   */
  views: string;
  getAdminMeta?: () => JSONValue;
  getBackingType: (
    path: string
  ) => Record<
    string,
    {
      optional: boolean;
      type: string;
    }
  >;
};

export type FieldControllerConfig<FieldMeta extends JSONValue | undefined = undefined> = {
  path: string;
  label: string;
  fieldMeta: FieldMeta;
};

type FilterTypeDeclaration<Value extends JSONValue> = {
  readonly label: string;
  readonly initialValue: Value;
};

export type FilterTypeToFormat<Value extends JSONValue> = {
  readonly type: string;
  readonly label: string;
  readonly value: Value;
};

export type FieldController<FormState, FilterValue extends JSONValue = never> = {
  path: string;
  label: string;
  graphqlSelection: string;
  defaultValue: FormState;
  deserialize: (item: any) => FormState;
  serialize: (formState: FormState) => any;
  validate?: (formState: FormState) => void;
  filter?: {
    // wrote a little codemod for this https://astexplorer.net/#/gist/c45e0f093513dded95114bb77da50b09/b3d01e21c1b425f90ca3cc5bd453d85b11500540
    types: Record<string, FilterTypeDeclaration<FilterValue>>;
    graphql(type: { type: string; value: FilterValue }): Record<string, any>;
    format(type: FilterTypeToFormat<FilterValue>): string;
  };
};

export type SerializedFieldMeta = {
  label: string;
  views: number;
  isOrderable: boolean;
  fieldMeta: JSONValue | undefined;
};

export type FieldMeta = {
  label: string;
  isOrderable: boolean;
  views: FieldViews[string];
  fieldMeta: JSONValue | undefined;
  controller: FieldController<unknown, JSONValue>;
};

type BaseListMeta = {
  key: string;
  path: string;
  label: string;
  singular: string;
  plural: string;
  description?: string;
  gqlNames: GqlNames;
  initialColumns: string[];
  pageSize: number;
};

export type SerializedListMeta = BaseListMeta & {
  fields: {
    [path: string]: SerializedFieldMeta;
  };
};

export type ListMeta = BaseListMeta & {
  fields: {
    [path: string]: FieldMeta;
  };
};

export type AdminConfig = {
  components?: {
    Logo?: ComponentType;
  };
};

export type SerializedAdminMeta = {
  enableSignout: boolean;
  enableSessionItem: boolean;
  lists: {
    [list: string]: SerializedListMeta;
  };
};

export type AdminMeta = {
  enableSignout: boolean;
  enableSessionItem: boolean;
  lists: {
    [list: string]: ListMeta;
  };
};

export type FieldProps<FieldControllerFn extends (...args: any) => FieldController<any, any>> = {
  field: ReturnType<FieldControllerFn>;
  value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>;
  // TODO: Make this optional; when not provided, it means the field is in "read" mode
  onChange(value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>): void;
};

export type Keystone = {
  keystone: any;
  config: KeystoneConfig;
  adminMeta: SerializedAdminMeta;
  graphQLSchema: GraphQLSchema;
  createContext: (args: { sessionContext?: SessionContext; skipAccessControl?: boolean }) => any;
  createContextFromRequest: (req: IncomingMessage, res: ServerResponse) => any;
  createSessionContext:
    | ((req: IncomingMessage, res: ServerResponse) => Promise<SessionContext>)
    | undefined;
  views: string[];
};

export type FieldViews = {
  [type: string]: {
    Field: (props: FieldProps<any>) => ReactElement;
    Cell: CellComponent;
    controller: (args: FieldControllerConfig<any>) => FieldController<unknown, JSONValue>;
  };
};

export type SessionContext = {
  session: any;
  startSession?(data: any): Promise<string>;
  endSession?(data: any): Promise<void>;
};

// TODO: This needs to be reviewed and expanded
export type BaseKeystoneList = {
  key: string;
  adminUILabels: {
    label: string;
    singular: string;
    plural: string;
    path: string;
  };
  gqlNames: {
    outputTypeName: string;
    itemQueryName: string;
    listQueryName: string;
    listQueryMetaName: string;
    listMetaName: string;
    listSortName: string;
    deleteMutationName: string;
    updateMutationName: string;
    createMutationName: string;
    deleteManyMutationName: string;
    updateManyMutationName: string;
    createManyMutationName: string;
    whereInputName: string;
    whereUniqueInputName: string;
    updateInputName: string;
    createInputName: string;
    updateManyInputName: string;
    createManyInputName: string;
    relateToManyInputName: string;
    relateToOneInputName: string;
  };
  listQuery(
    args: Record<string, any>,
    context: any,
    gqlName?: string,
    info?: any,
    from?: any
  ): Promise<Record<string, any>[]>;
  listQueryMeta(
    args: Record<string, any>,
    context: any,
    gqlName?: string,
    info?: any,
    from?: any
  ): {
    getCount: () => Promise<number>;
  };
  itemQuery(
    args: { where: { id: string } },
    context: any,
    gqlName?: string,
    info?: any
  ): Promise<Record<string, any>>;
  createMutation(
    data: Record<string, any>,
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>>;
  createManyMutation(
    data: Record<string, any>[],
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
  updateMutation(
    id: string,
    data: Record<string, any>,
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>>;
  updateManyMutation(
    data: Record<string, any>,
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
  deleteMutation(id: string, context: any, mutationState?: any): Promise<Record<string, any>>;
  deleteManyMutation(
    ids: string[],
    context: any,
    mutationState?: any
  ): Promise<Record<string, any>[]>;
};

export type KeystoneCrudAPI<
  KeystoneListsTypeInfo extends Record<string, BaseGeneratedListTypes>
> = {
  [Key in keyof KeystoneListsTypeInfo]: {
    findMany(
      args: KeystoneListsTypeInfo[Key]['args']['listQuery']
    ): Promise<readonly KeystoneListsTypeInfo[Key]['backing'][]>;
    findOne(args: {
      readonly where: { readonly id: string };
    }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    count(args: KeystoneListsTypeInfo[Key]['args']['listQuery']): Promise<number>;
    updateOne(args: {
      readonly id: string;
      readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    updateMany(args: {
      readonly data: readonly {
        readonly id: string;
        readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'];
      }[];
    }): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
    createOne(args: {
      readonly data: KeystoneListsTypeInfo[Key]['inputs']['create'];
    }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    createMany(args: {
      readonly data: readonly { readonly data: KeystoneListsTypeInfo[Key]['inputs']['update'] }[];
    }): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
    deleteOne(args: { readonly id: string }): Promise<KeystoneListsTypeInfo[Key]['backing'] | null>;
    deleteMany(args: {
      readonly ids: readonly string[];
    }): Promise<(KeystoneListsTypeInfo[Key]['backing'] | null)[] | null>;
  };
};
