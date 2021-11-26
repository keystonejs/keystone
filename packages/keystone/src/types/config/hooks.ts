import type { KeystoneContextFromListTypes } from '..';
import { BaseGeneratedListTypes } from '../generated';

type CommonArgs<GeneratedListTypes extends BaseGeneratedListTypes> = {
  context: KeystoneContextFromListTypes<GeneratedListTypes>;
  /**
   * The key of the list that the operation is occurring on
   */
  listKey: string;
};

export type ListHooks<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?: ResolveInputHook<TGeneratedListTypes>;
  /**
   * Used to **validate the input** for create and update operations once all resolveInput hooks resolved
   */
  validateInput?: ValidateInputHook<TGeneratedListTypes>;
  /**
   * Used to **validate** that a delete operation can happen after access control has occurred
   */
  validateDelete?: ValidateDeleteHook<TGeneratedListTypes>;
  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: BeforeOperationHook<TGeneratedListTypes>;
  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: AfterOperationHook<TGeneratedListTypes>;
};

// TODO: probably maybe don't do this and write it out manually
// (this is also incorrect because the return value is wrong for many of them)
type AddFieldPathToObj<T extends (arg: any) => any> = T extends (args: infer Args) => infer Result
  ? (args: Args & { fieldKey: string }) => Result
  : never;

type AddFieldPathArgToAllPropsOnObj<T extends Record<string, (arg: any) => any>> = {
  [Key in keyof T]: AddFieldPathToObj<T[Key]>;
};

export type FieldHooks<TGeneratedListTypes extends BaseGeneratedListTypes> =
  AddFieldPathArgToAllPropsOnObj<ListHooks<TGeneratedListTypes>>;

type ArgsForCreateOrUpdateOperation<TGeneratedListTypes extends BaseGeneratedListTypes> =
  | {
      operation: 'create';
      // technically this will never actually exist for a create
      // but making it optional rather than not here
      // makes for a better experience
      // because then people will see the right type even if they haven't refined the type of operation to 'create'
      item?: TGeneratedListTypes['backing'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: TGeneratedListTypes['inputs']['create'];
      /**
       * The GraphQL input **after** default values are applied
       */
      resolvedData: TGeneratedListTypes['inputs']['create'];
    }
  | {
      operation: 'update';
      item: TGeneratedListTypes['backing'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: TGeneratedListTypes['inputs']['update'];
      /**
       * The GraphQL input **after** default values are applied
       */
      resolvedData: TGeneratedListTypes['inputs']['update'];
    };

type ResolveInputHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: ArgsForCreateOrUpdateOperation<TGeneratedListTypes> & CommonArgs<TGeneratedListTypes>
) =>
  | Promise<TGeneratedListTypes['inputs']['create'] | TGeneratedListTypes['inputs']['update']>
  | TGeneratedListTypes['inputs']['create']
  | TGeneratedListTypes['inputs']['update']
  // TODO: I'm pretty sure this is wrong, but without these additional types you can't define a
  // resolveInput hook for a field that returns a simple value (e.g timestamp)
  | Record<string, any>
  | string
  | number
  | boolean
  | null;

type ValidateInputHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: ArgsForCreateOrUpdateOperation<TGeneratedListTypes> & {
    addValidationError: (error: string) => void;
  } & CommonArgs<TGeneratedListTypes>
) => Promise<void> | void;

type ValidateDeleteHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: {
    operation: 'delete';
    item: TGeneratedListTypes['backing'];
    addValidationError: (error: string) => void;
  } & CommonArgs<TGeneratedListTypes>
) => Promise<void> | void;

type BeforeOperationHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: (
    | ArgsForCreateOrUpdateOperation<TGeneratedListTypes>
    | {
        operation: 'delete';
        item: TGeneratedListTypes['backing'];
        inputData: undefined;
        resolvedData: undefined;
      }
  ) &
    CommonArgs<TGeneratedListTypes>
) => Promise<void> | void;

type AfterOperationHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: (
    | ArgsForCreateOrUpdateOperation<TGeneratedListTypes>
    | {
        operation: 'delete';
        // technically this will never actually exist for a create
        // but making it optional rather than not here
        // makes for a better experience
        // because then people will see the right type even if they haven't refined the type of operation to 'create'
        item?: TGeneratedListTypes['backing'];
        inputData: undefined;
        resolvedData: undefined;
      }
  ) & {
    originalItem: TGeneratedListTypes['backing'];
  } & CommonArgs<TGeneratedListTypes>
) => Promise<void> | void;
