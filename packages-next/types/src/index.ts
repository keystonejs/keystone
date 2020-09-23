import type { ComponentType, ReactElement } from 'react';
import type { FieldAccessControl } from './schema/access-control';
import type {
  BaseGeneratedListTypes,
  JSONValue,
  GqlNames,
  GraphQLContext,
  MaybePromise,
} from './utils';
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
  session?: (args: { keystone: KeystoneConfig }) => SessionStrategy<any>;
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

type AllModes = 'edit' | 'read' | 'hidden';

type FieldModeThing<Modes extends AllModes> =
  | Modes
  | {
      [key in Modes]: boolean | { [path: string]: any };
    };
type FieldMode<Modes extends AllModes> =
  | FieldModeThing<Modes>
  | ((args: { context: GraphQLContext }) => FieldModeThing<Modes>);

export type FieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  hooks?: ListHooks<TGeneratedListTypes>;
  access?: FieldAccessControl<TGeneratedListTypes>;
  admin?: {
    views?: string;
    description?: string;
    createView?: {
      fieldMode?: FieldMode<'edit' | 'hidden'>;
    };
    listView?: {
      fieldMode?: FieldMode<'read' | 'hidden'>;
    };
    itemView?: {
      fieldMode?: FieldMode<'edit' | 'read' | 'hidden'>;
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

export function makeController<
  FieldControllerFn extends (config: FieldControllerConfig<any>) => FieldController<any>
>(controller: FieldControllerFn) {
  return controller;
}

export type FieldControllerConfig<FieldMeta extends JSONValue | undefined = undefined> = {
  path: string;
  label: string;
  fieldMeta: FieldMeta;
};

export type FieldController<FormState> = {
  path: string;
  label: string;
  graphqlSelection: string;
  defaultValue: FormState;
  deserialize: (item: any) => FormState;
  serialize: (formState: FormState) => any;
  validate?: (formState: FormState) => void;
};

export type SerializedFieldMeta = {
  label: string;
  views: number;
  fieldMeta: JSONValue | undefined;
};

export type FieldMeta = {
  label: string;
  views: FieldViews[string];
  fieldMeta: JSONValue | undefined;
  controller: FieldController<unknown>;
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

export type FieldProps<FieldControllerFn extends (...args: any) => FieldController<any>> = {
  field: ReturnType<FieldControllerFn>;
  value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>;
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
    controller: (args: FieldControllerConfig<any>) => FieldController<unknown>;
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
};
