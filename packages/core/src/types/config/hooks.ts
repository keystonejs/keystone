import type { KeystoneContextFromListTypeInfo, MaybePromise } from '..';
import type { BaseListTypeInfo } from '../type-info';

type CommonArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: KeystoneContextFromListTypeInfo<ListTypeInfo>;
  /**
   * The key of the list that the operation is occurring on
   */
  listKey: ListTypeInfo['key'];
};

type ResolveInputListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update'
> = (
  args: {
    create: {
      operation: 'create';
      item: undefined;
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create'];
    };
    update: {
      operation: 'update';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update'];
    };
  }[Operation] &
    CommonArgs<ListTypeInfo>
) => MaybePromise<ListTypeInfo['prisma'][Operation]>;

export type ListHooks<ListTypeInfo extends BaseListTypeInfo> = {
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?:
    | ResolveInputListHook<ListTypeInfo, 'create' | 'update'>
    | {
        create?: ResolveInputListHook<ListTypeInfo, 'create'>;
        update?: ResolveInputListHook<ListTypeInfo, 'update'>;
      };
  /**
   * Used to **validate the input** for create and update operations once all resolveInput hooks resolved
   */
  validateInput?: ValidateHook<ListTypeInfo, 'create' | 'update'>;

  /**
   * Used to **validate** that a delete operation can happen after access control has occurred
   */
  validateDelete?: ValidateHook<ListTypeInfo, 'delete'>;

  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: BeforeOperationListHook<ListTypeInfo, 'create' | 'update' | 'delete'>;
  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: AfterOperationListHook<ListTypeInfo, 'create' | 'update' | 'delete'>;
};

export type ResolvedListHooks<ListTypeInfo extends BaseListTypeInfo> = {
  resolveInput: {
    create: ResolveInputListHook<ListTypeInfo, 'create'>;
    update: ResolveInputListHook<ListTypeInfo, 'update'>;
  };
  validateInput: ValidateHook<ListTypeInfo, 'create' | 'update'>;
  validateDelete: ValidateHook<ListTypeInfo, 'delete'>;
  beforeOperation: BeforeOperationListHook<ListTypeInfo, 'create' | 'update' | 'delete'>;
  afterOperation: AfterOperationListHook<ListTypeInfo, 'create' | 'update' | 'delete'>;
};

export type FieldHooks<
  ListTypeInfo extends BaseListTypeInfo,
  FieldKey extends ListTypeInfo['fields'] = ListTypeInfo['fields']
> = {
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?: ResolveInputFieldHook<ListTypeInfo, 'create' | 'update', FieldKey>;
  /**
   * Used to **validate the input** for create and update operations once all resolveInput hooks resolved
   */
  validateInput?: ValidateFieldHook<ListTypeInfo, 'create' | 'update', FieldKey>;
  /**
   * Used to **validate** that a delete operation can happen after access control has occurred
   */
  validateDelete?: ValidateFieldHook<ListTypeInfo, 'delete', FieldKey>;
  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: BeforeOperationFieldHook<
    ListTypeInfo,
    'create' | 'update' | 'delete',
    FieldKey
  >;
  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: AfterOperationFieldHook<ListTypeInfo, FieldKey>;
};

export type ResolvedFieldHooks<
  ListTypeInfo extends BaseListTypeInfo,
  FieldKey extends ListTypeInfo['fields'] = ListTypeInfo['fields']
> = {
  resolveInput: ResolveInputFieldHook<ListTypeInfo, 'create' | 'update', FieldKey>;
  validateInput: ValidateFieldHook<ListTypeInfo, 'create' | 'update', FieldKey>;
  validateDelete: ValidateFieldHook<ListTypeInfo, 'delete', FieldKey>;
  beforeOperation: BeforeOperationFieldHook<ListTypeInfo, 'create' | 'update' | 'delete', FieldKey>;
  afterOperation: AfterOperationFieldHook<ListTypeInfo, FieldKey>;
};

type ResolveInputFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update',
  FieldKey extends ListTypeInfo['fields']
> = (
  args: {
    create: {
      operation: 'create';
      item: undefined;
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create'];
    };
    update: {
      operation: 'update';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update'];
    };
  }[Operation] &
    CommonArgs<ListTypeInfo> & { fieldKey: FieldKey }
) => MaybePromise<
  ListTypeInfo['prisma']['create' | 'update'][FieldKey] | undefined // undefined represents 'don't do anything'
>;

type ValidateHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete'
> = (
  args: {
    create: {
      operation: 'create';
      item: undefined;
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create'];
      addValidationError: (error: string) => void;
    };
    update: {
      operation: 'update';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update'];
      addValidationError: (error: string) => void;
    };
    delete: {
      operation: 'delete';
      item: ListTypeInfo['item'];
      inputData: undefined; // TODO: remove?
      resolvedData: undefined; // TODO: remove?
      addValidationError: (error: string) => void;
    };
  }[Operation] &
    CommonArgs<ListTypeInfo>
) => MaybePromise<void>;

type ValidateFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete',
  FieldKey extends ListTypeInfo['fields']
> = (
  args: {
    create: {
      operation: 'create';
      item: undefined;
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create'];
      addValidationError: (error: string) => void;
    };
    update: {
      operation: 'update';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update'];
      addValidationError: (error: string) => void;
    };
    delete: {
      operation: 'delete';
      item: ListTypeInfo['item'];
      inputData: undefined; // TODO: remove?
      resolvedData: undefined; // TODO: remove?
      addValidationError: (error: string) => void;
    };
  }[Operation] &
    CommonArgs<ListTypeInfo> & { fieldKey: FieldKey }
) => MaybePromise<void>;

type BeforeOperationListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete'
> = (
  args: {
    create: {
      operation: 'create';
      item: undefined;
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create'];
    };
    update: {
      operation: 'update';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update'];
    };
    delete: {
      operation: 'delete';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: undefined;
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: undefined;
    };
  }[Operation] &
    CommonArgs<ListTypeInfo>
) => MaybePromise<void>;

type BeforeOperationFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete',
  FieldKey extends ListTypeInfo['fields']
> = (
  args: {
    create: {
      operation: 'create';
      item: undefined;
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create'];
    };
    update: {
      operation: 'update';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update'];
    };
    delete: {
      operation: 'delete';
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: undefined;
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: undefined;
    };
  }[Operation] &
    CommonArgs<ListTypeInfo> & { fieldKey: FieldKey }
) => MaybePromise<void>;

type AfterOperationListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete'
> = (
  args: {
    create: {
      operation: 'create';
      originalItem: undefined;
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create'];
    };
    update: {
      operation: 'update';
      originalItem: ListTypeInfo['item'];
      item: ListTypeInfo['item'];
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update'];
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update'];
    };
    delete: {
      operation: 'delete';
      originalItem: ListTypeInfo['item'];
      item: undefined;
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: undefined;
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: undefined;
    };
  }[Operation] &
    CommonArgs<ListTypeInfo>
) => MaybePromise<void>;

type AfterOperationFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  FieldKey extends ListTypeInfo['fields']
> = (
  args: (
    | {
        operation: 'create';
        originalItem: undefined;
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
         * The GraphQL input **after** being resolved by the field type's input resolver
         */
        resolvedData: ListTypeInfo['prisma']['create'];
      }
    | {
        operation: 'update';
        item: ListTypeInfo['item'];
        originalItem: ListTypeInfo['item'];
        /**
         * The GraphQL input **before** default values are applied
         */
        inputData: ListTypeInfo['inputs']['update'];
        /**
         * The GraphQL input **after** being resolved by the field type's input resolver
         */
        resolvedData: ListTypeInfo['prisma']['update'];
      }
    | {
        operation: 'delete';
        // technically this will never actually exist for a delete
        // but making it optional rather than not here
        // makes for a better experience
        // because then people will see the right type even if they haven't refined the type of operation to 'delete'
        item: undefined;
        originalItem: ListTypeInfo['item'];
        inputData: undefined;
        resolvedData: undefined;
      }
  ) &
    CommonArgs<ListTypeInfo> & { fieldKey: FieldKey }
) => MaybePromise<void>;
