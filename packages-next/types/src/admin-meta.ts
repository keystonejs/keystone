import type { ComponentType, ReactElement } from 'react';
import { GqlNames, JSONValue } from './utils';

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
  fieldMeta: JSONValue;
};

export type FieldMeta = {
  label: string;
  isOrderable: boolean;
  views: FieldViews[string];
  fieldMeta: JSONValue;
  controller: FieldController<unknown, JSONValue>;
};

type BaseListMeta = {
  key: string;
  path: string;
  label: string;
  singular: string;
  plural: string;
  description: string | null;
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

export type FieldViews = {
  [type: string]: {
    Field: (props: FieldProps<any>) => ReactElement;
    Cell: CellComponent;
    controller: (args: FieldControllerConfig<any>) => FieldController<unknown, JSONValue>;
  };
};

export type CellComponent = {
  (props: {
    item: Record<string, any>;
    path: string;
    linkTo: { href: string; as: string } | undefined;
  }): ReactElement;

  supportsLinkTo?: boolean;
};
