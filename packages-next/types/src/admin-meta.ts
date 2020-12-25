import type { ComponentType, ReactElement } from 'react';
import { GqlNames, JSONValue } from './utils';

export type AdminConfig = { components?: { Logo?: ComponentType } };

export type FieldControllerConfig<FieldMeta extends JSONValue | undefined = undefined> = {
  listKey: string;
  path: string;
  label: string;
  customViews: Record<string, any>;
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

export type FieldMeta = {
  path: string;
  label: string;
  isOrderable: boolean;
  fieldMeta: JSONValue;
  viewsHash: string;
  customViewsHash: string | null;
  views: FieldViews[number];
  controller: FieldController<unknown, JSONValue>;
};

export type ListMeta = {
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
  initialSort: null | { direction: 'ASC' | 'DESC'; field: string };
  fields: { [path: string]: FieldMeta };
};

export type AdminMeta = {
  enableSignout: boolean;
  enableSessionItem: boolean;
  lists: { [list: string]: ListMeta };
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

export type FieldViews = Record<
  string,
  {
    Field: (props: FieldProps<any>) => ReactElement | null;
    Cell: CellComponent;
    CardValue: CardValueComponent;
    controller: (args: FieldControllerConfig<any>) => FieldController<unknown, JSONValue>;
    allowedExportsOnCustomViews?: string[];
  }
>;

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
  }): ReactElement | null;

  supportsLinkTo?: boolean;
};

export type CardValueComponent<
  FieldControllerFn extends (...args: any) => FieldController<any, any> = () => FieldController<
    any,
    any
  >
> = (props: { item: Record<string, any>; field: ReturnType<FieldControllerFn> }) => ReactElement;

// Types used on the server by the Admin UI schema resolvers
export type FieldMetaRootVal = {
  path: string;
  label: string;
  isOrderable: boolean;
  fieldMeta: JSONValue | null;
  viewsHash: string;
  customViewsHash: string | null;
  listKey: string;
};

export type ListMetaRootVal = {
  key: string;
  path: string;
  label: string;
  singular: string;
  plural: string;
  initialColumns: string[];
  pageSize: number;
  labelField: string;
  initialSort: { field: string; direction: 'ASC' | 'DESC' } | null;
  fields: Array<FieldMetaRootVal>;
  itemQueryName: string;
  listQueryName: string;
  description: string | null;
};

export type AdminMetaRootVal = {
  enableSignout: boolean;
  enableSessionItem: boolean;
  lists: Array<ListMetaRootVal>;
  listsByKey: Record<string, ListMetaRootVal>;
};
