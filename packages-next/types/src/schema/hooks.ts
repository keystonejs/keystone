import type { GraphQLContext, BaseGeneratedListTypes } from '../utils';

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
   * Used to **cause side effects** before a create or update operation once all validateInput hooks have resolved
   */
  beforeChange?: BeforeOrAfterChangeHook<TGeneratedListTypes>;
  /**
   * Used to **cause side effects** after a create or update operation operation has occurred
   */
  afterChange?: BeforeOrAfterChangeHook<TGeneratedListTypes>;
  /**
   * Used to **validate** that a delete operation can happen after access control has occurred
   */
  validateDelete?: ValidateDeleteHook<TGeneratedListTypes>;
  /**
   * Used to **cause side effects** before a delete operation operation has occurred
   */
  beforeDelete?: BeforeOrAfterDeleteHook<TGeneratedListTypes>;
  /**
   * Used to **cause side effects** after a delete operation operation has occurred
   */
  afterDelete?: BeforeOrAfterChangeHook<TGeneratedListTypes>;
};

type ArgsForCreateOrUpdateOperation<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  | {
      operation: 'create';
      // technically this will never actually exist for a create
      // but making it optional rather than not here
      // makes for a better experience
      // because then people will see the right type even if they haven't refined the type of operation to 'create'
      existingItem?: TGeneratedListTypes['backing'];
      /**
       * The GraphQL input **before** default values are applied
       */
      originalInput: TGeneratedListTypes['inputs']['create'];
      /**
       * The GraphQL input **after** default values are applied
       */
      resolvedData: TGeneratedListTypes['inputs']['create'];
    }
  | {
      operation: 'update';
      existingItem: TGeneratedListTypes['backing'];
      /**
       * The GraphQL input **before** default values are applied
       */
      originalInput: TGeneratedListTypes['inputs']['update'];
      /**
       * The GraphQL input **after** default values are applied
       */
      resolvedData: TGeneratedListTypes['inputs']['update'];
    }
) & {
  context: GraphQLContext;
  /**
   * The key of the list that the operation is occurring on
   */
  listKey: string;
};

type ValidationArgs = {
  addValidationError: (error: string) => void;
};

type ResolveInputHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: ArgsForCreateOrUpdateOperation<TGeneratedListTypes>
) =>
  | Promise<TGeneratedListTypes['inputs']['create'] | TGeneratedListTypes['inputs']['update']>
  | TGeneratedListTypes['inputs']['create']
  | TGeneratedListTypes['inputs']['update'];

type ValidateInputHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: ArgsForCreateOrUpdateOperation<TGeneratedListTypes> & ValidationArgs
) => Promise<void> | void;

type BeforeOrAfterChangeHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: ArgsForCreateOrUpdateOperation<TGeneratedListTypes>
) => Promise<void> | void;

type ArgsForDeleteOperation<TGeneratedListTypes extends BaseGeneratedListTypes> = {
  operation: 'delete';
  existingItem: TGeneratedListTypes['backing'];
  context: GraphQLContext;
  listKey: string;
};

type ValidateDeleteHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: ArgsForDeleteOperation<TGeneratedListTypes> & ValidationArgs
) => Promise<void> | void;

type BeforeOrAfterDeleteHook<TGeneratedListTypes extends BaseGeneratedListTypes> = (
  args: ArgsForDeleteOperation<TGeneratedListTypes>
) => Promise<void> | void;
