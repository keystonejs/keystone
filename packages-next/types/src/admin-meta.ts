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
  validate?: (formState: FormState) => boolean;
  filter?: {
    // wrote a little codemod for this https://astexplorer.net/#/gist/c45e0f093513dded95114bb77da50b09/b3d01e21c1b425f90ca3cc5bd453d85b11500540
    types: Record<string, FilterTypeDeclaration<FilterValue>>;
    graphql(type: { type: string; value: FilterValue }): Record<string, any>;
    Label(type: FilterTypeToFormat<FilterValue>): string | ReactElement | null;
    Filter(props: {
      type: string;
      value: FilterValue;
      onChange(value: FilterValue): void;
      autoFocus?: boolean;
    }): ReactElement | null;
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

export type BaseListMeta = {
  key: string;
  path: string;
  label: string;
  singular: string;
  plural: string;
  description: string | null;
  gqlNames: GqlNames;
  initialColumns: string[];
  pageSize: number;
  labelField: string;
  initialSort: null | {
    direction: 'ASC' | 'DESC';
    field: string;
  };
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
  onChange?(value: ReturnType<ReturnType<FieldControllerFn>['deserialize']>): void;
  autoFocus?: boolean;
  /**
   * Will be true when the user has clicked submit and
   * the validate function on the field controller has returned false
   */
  forceValidation?: boolean;
};

export type FieldViews = {
  [type: string]: {
    Field: (props: FieldProps<any>) => ReactElement;
    Cell: CellComponent;
    controller: (args: FieldControllerConfig<any>) => FieldController<unknown, JSONValue>;
  };
};

export type CellComponent<
  FieldControllerFn extends (...args: any) => FieldController<any, any> = () => FieldController<
    any,
    any
  >
> = {
  (props: {
    item: Record<string, any>;
    linkTo: { href: string; as: string } | undefined;
    field: ReturnType<FieldControllerFn>;
  }): ReactElement;

  supportsLinkTo?: boolean;
};
