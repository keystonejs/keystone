import type { KeystoneContextFromListTypeInfo } from '..';
import { BaseListTypeInfo } from '../type-info';

type CommonArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: KeystoneContextFromListTypeInfo<ListTypeInfo>;
  /**
   * The key of the list that the operation is occurring on
   */
  listKey: string;
};

export type ListHooks<ListTypeInfo extends BaseListTypeInfo> = {
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?: ResolveInputHook<ListTypeInfo>;
  /**
   * Used to **validate the input** for create and update operations once all resolveInput hooks resolved
   */
  validateInput?: ValidateInputHook<ListTypeInfo>;
  /**
   * Used to **validate** that a delete operation can happen after access control has occurred
   */
  validateDelete?: ValidateDeleteHook<ListTypeInfo>;
  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: BeforeOperationHook<ListTypeInfo>;
  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: AfterOperationHook<ListTypeInfo>;
};

// TODO: probably maybe don't do this and write it out manually
// (this is also incorrect because the return value is wrong for many of them)
type AddFieldPathToObj<T extends (arg: any) => any> = T extends (args: infer Args) => infer Result
  ? (args: Args & { fieldKey: string }) => Result
  : never;

type AddFieldPathArgToAllPropsOnObj<T extends Record<string, (arg: any) => any>> = {
  [Key in keyof T]: AddFieldPathToObj<T[Key]>;
};

export type FieldHooks<ListTypeInfo extends BaseListTypeInfo> = AddFieldPathArgToAllPropsOnObj<
  ListHooks<ListTypeInfo>
>;

type ArgsForCreateOrUpdateOperation<ListTypeInfo extends BaseListTypeInfo> =
  | {
      operation: 'create';
      // technically this will never actually exist for a create
      // but making it optional rather than not here
      // makes for a better experience
      // because then people will see the right type even if they haven't refined the type of operation to 'create'
      item?: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** default values are applied
       */
      resolvedData: ListTypeInfo['inputs']['create'];
    }
  | {
      operation: 'update';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** default values are applied
       */
      resolvedData: ListTypeInfo['inputs']['update'];
    };

type ResolveInputHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: ArgsForCreateOrUpdateOperation<ListTypeInfo> & CommonArgs<ListTypeInfo>
) =>
  | Promise<ListTypeInfo['inputs']['create'] | ListTypeInfo['inputs']['update']>
  | ListTypeInfo['inputs']['create']
  | ListTypeInfo['inputs']['update']
  // TODO: I'm pretty sure this is wrong, but without these additional types you can't define a
  // resolveInput hook for a field that returns a simple value (e.g timestamp)
  | Record<string, any>
  | string
  | number
  | boolean
  | null;

type ValidateInputHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: ArgsForCreateOrUpdateOperation<ListTypeInfo> & {
    addValidationError: (error: string) => void;
  } & CommonArgs<ListTypeInfo>
) => Promise<void> | void;

type ValidateDeleteHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: {
    operation: 'delete';
    item: ListTypeInfo['item'];
    addValidationError: (error: string) => void;
  } & CommonArgs<ListTypeInfo>
) => Promise<void> | void;

type BeforeOperationHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: (
    | ArgsForCreateOrUpdateOperation<ListTypeInfo>
    | {
        operation: 'delete';
        item: ListTypeInfo['item'];
        inputData: undefined;
        resolvedData: undefined;
      }
  ) &
    CommonArgs<ListTypeInfo>
) => Promise<void> | void;

type AfterOperationHook<ListTypeInfo extends BaseListTypeInfo> = (
  args: (
    | ArgsForCreateOrUpdateOperation<ListTypeInfo>
    | {
        operation: 'delete';
        // technically this will never actually exist for a delete
        // but making it optional rather than not here
        // makes for a better experience
        // because then people will see the right type even if they haven't refined the type of operation to 'delete'
        item: undefined;
        inputData: undefined;
        resolvedData: undefined;
      }
  ) &
    ({ operation: 'delete' } | { operation: 'create' | 'update'; item: ListTypeInfo['item'] }) &
    (
      | // technically this will never actually exist for a create
      // but making it optional rather than not here
      // makes for a better experience
      // because then people will see the right type even if they haven't refined the type of operation to 'create'
      { operation: 'create'; originalItem: undefined }
      | { operation: 'delete' | 'update'; originalItem: ListTypeInfo['item'] }
    ) &
    CommonArgs<ListTypeInfo>
) => Promise<void> | void;
