import type { KeystoneContextFromModelTypeInfo, MaybePromise } from '..';
import { BaseModelTypeInfo } from '../type-info';

type CommonArgs<ModelTypeInfo extends BaseModelTypeInfo> = {
  context: KeystoneContextFromModelTypeInfo<ModelTypeInfo>;
  /**
   * The key of the model that the operation is occurring on
   */
  modelKey: string;
};

export type ListHooks<ModelTypeInfo extends BaseModelTypeInfo> = {
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?: ResolveInputModelHook<ModelTypeInfo>;
  /**
   * Used to **validate the input** for create and update operations once all resolveInput hooks resolved
   */
  validateInput?: ValidateInputHook<ModelTypeInfo>;
  /**
   * Used to **validate** that a delete operation can happen after access control has occurred
   */
  validateDelete?: ValidateDeleteHook<ModelTypeInfo>;
  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: BeforeOperationHook<ModelTypeInfo>;
  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: AfterOperationHook<ModelTypeInfo>;
};

// TODO: probably maybe don't do this and write it out manually
// (this is also incorrect because the return value is wrong for many of them)
type AddFieldPathToObj<T extends (arg: any) => any> = T extends (args: infer Args) => infer Result
  ? (args: Args & { fieldKey: string }) => Result
  : never;

type AddFieldPathArgToAllPropsOnObj<T extends Record<string, (arg: any) => any>> = {
  [Key in keyof T]: AddFieldPathToObj<T[Key]>;
};

type FieldKeysForModel<ModelTypeInfo extends BaseModelTypeInfo> =
  | keyof ModelTypeInfo['prisma']['create']
  | keyof ModelTypeInfo['prisma']['update'];

export type FieldHooks<
  ModelTypeInfo extends BaseModelTypeInfo,
  FieldKey extends FieldKeysForModel<ModelTypeInfo> = FieldKeysForModel<ModelTypeInfo>
> = AddFieldPathArgToAllPropsOnObj<{
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?: ResolveInputFieldHook<ModelTypeInfo, FieldKey>;
  /**
   * Used to **validate the input** for create and update operations once all resolveInput hooks resolved
   */
  validateInput?: ValidateInputHook<ModelTypeInfo>;
  /**
   * Used to **validate** that a delete operation can happen after access control has occurred
   */
  validateDelete?: ValidateDeleteHook<ModelTypeInfo>;
  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: BeforeOperationHook<ModelTypeInfo>;
  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: AfterOperationHook<ModelTypeInfo>;
}>;

type ArgsForCreateOrUpdateOperation<ModelTypeInfo extends BaseModelTypeInfo> =
  | {
      operation: 'create';
      // technically this will never actually exist for a create
      // but making it optional rather than not here
      // makes for a better experience
      // because then people will see the right type even if they haven't refined the type of operation to 'create'
      item?: ModelTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ModelTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ModelTypeInfo['prisma']['create'];
    }
  | {
      operation: 'update';
      item: ModelTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ModelTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ModelTypeInfo['prisma']['update'];
    };

type ResolveInputModelHook<ModelTypeInfo extends BaseModelTypeInfo> = (
  args: ArgsForCreateOrUpdateOperation<ModelTypeInfo> & CommonArgs<ModelTypeInfo>
) => MaybePromise<ModelTypeInfo['prisma']['create'] | ModelTypeInfo['prisma']['update']>;

type ResolveInputFieldHook<
  ModelTypeInfo extends BaseModelTypeInfo,
  FieldKey extends FieldKeysForModel<ModelTypeInfo>
> = (
  args: ArgsForCreateOrUpdateOperation<ModelTypeInfo> & CommonArgs<ModelTypeInfo>
) => MaybePromise<
  | ModelTypeInfo['prisma']['create'][FieldKey]
  | ModelTypeInfo['prisma']['update'][FieldKey]
  | undefined // undefined represents 'don't do anything'
>;

type ValidateInputHook<ModelTypeInfo extends BaseModelTypeInfo> = (
  args: ArgsForCreateOrUpdateOperation<ModelTypeInfo> & {
    addValidationError: (error: string) => void;
  } & CommonArgs<ModelTypeInfo>
) => Promise<void> | void;

type ValidateDeleteHook<ModelTypeInfo extends BaseModelTypeInfo> = (
  args: {
    operation: 'delete';
    item: ModelTypeInfo['item'];
    addValidationError: (error: string) => void;
  } & CommonArgs<ModelTypeInfo>
) => Promise<void> | void;

type BeforeOperationHook<ModelTypeInfo extends BaseModelTypeInfo> = (
  args: (
    | ArgsForCreateOrUpdateOperation<ModelTypeInfo>
    | {
        operation: 'delete';
        item: ModelTypeInfo['item'];
        inputData: undefined;
        resolvedData: undefined;
      }
  ) &
    CommonArgs<ModelTypeInfo>
) => Promise<void> | void;

type AfterOperationHook<ModelTypeInfo extends BaseModelTypeInfo> = (
  args: (
    | ArgsForCreateOrUpdateOperation<ModelTypeInfo>
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
    ({ operation: 'delete' } | { operation: 'create' | 'update'; item: ModelTypeInfo['item'] }) &
    (
      | // technically this will never actually exist for a create
      // but making it optional rather than not here
      // makes for a better experience
      // because then people will see the right type even if they haven't refined the type of operation to 'create'
      { operation: 'create'; originalItem: undefined }
      | { operation: 'delete' | 'update'; originalItem: ModelTypeInfo['item'] }
    ) &
    CommonArgs<ModelTypeInfo>
) => Promise<void> | void;
