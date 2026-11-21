import type { BaseFieldTypeInfo, KeystoneContextFromListTypeInfo, MaybePromise } from '../index.ts'
import type { BaseListTypeInfo } from '../type-info.ts'

type CommonArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: KeystoneContextFromListTypeInfo<ListTypeInfo>
  /**
   * The key of the list that the operation is occurring on
   */
  listKey: ListTypeInfo['key']
}

type OperationHooks<CreateArgs, UpdateArgs, DeleteArgs> =
  | ((args: CreateArgs | UpdateArgs | DeleteArgs) => MaybePromise<void>)
  | {
      create?: (args: CreateArgs) => MaybePromise<void>
      update?: (args: UpdateArgs) => MaybePromise<void>
      delete?: (args: DeleteArgs) => MaybePromise<void>
    }

export type TransactionHooks<CreateArgs, UpdateArgs, DeleteArgs> = {
  /** Runs after context.transaction() commits. A failure cannot undo committed writes. */
  afterCommit?: OperationHooks<CreateArgs, UpdateArgs, DeleteArgs>
  /**
   * Runs after context.transaction() rejects. `error` is the original transaction failure.
   * Item/input arguments describe the attempted write, not the database after rollback.
   */
  afterRollback?: OperationHooks<
    CreateArgs & { error: unknown },
    UpdateArgs & { error: unknown },
    DeleteArgs & { error: unknown }
  >
}

type ResolvedTransactionHooks<CreateArgs, UpdateArgs, DeleteArgs> = {
  afterCommit: {
    create: (args: CreateArgs) => MaybePromise<void>
    update: (args: UpdateArgs) => MaybePromise<void>
    delete: (args: DeleteArgs) => MaybePromise<void>
  }
  afterRollback: {
    create: (args: CreateArgs & { error: unknown }) => MaybePromise<void>
    update: (args: UpdateArgs & { error: unknown }) => MaybePromise<void>
    delete: (args: DeleteArgs & { error: unknown }) => MaybePromise<void>
  }
}

type ResolveInputListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update',
> = (
  args: {
    create: {
      operation: 'create'
      item: undefined
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create']
    }
    update: {
      operation: 'update'
      item: ListTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update']
    }
  }[Operation] &
    CommonArgs<ListTypeInfo>
) => MaybePromise<ListTypeInfo['prisma'][Operation]>

export type ListHooks<ListTypeInfo extends BaseListTypeInfo> = {
  /**
   * Per-write callbacks for explicit context.transaction() settlement only.
   * Receive snapshots with afterOperation's create/update/delete argument shapes,
   * and a non-transactional context preserving the originating session and privileges.
   * Existing beforeOperation/afterOperation hooks still execute inside the transaction.
   */
  transaction?: TransactionHooks<
    Parameters<AfterOperationListHook<ListTypeInfo, 'create'>>[0],
    Parameters<AfterOperationListHook<ListTypeInfo, 'update'>>[0],
    Parameters<AfterOperationListHook<ListTypeInfo, 'delete'>>[0]
  >
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?:
    | ResolveInputListHook<ListTypeInfo, 'create' | 'update'>
    | {
        create?: ResolveInputListHook<ListTypeInfo, 'create'>
        update?: ResolveInputListHook<ListTypeInfo, 'update'>
      }

  /**
   * Used to **validate** if a create, update or delete operation is OK
   */
  validate?:
    | ValidateHook<ListTypeInfo, 'create' | 'update' | 'delete'>
    | {
        create?: ValidateHook<ListTypeInfo, 'create'>
        update?: ValidateHook<ListTypeInfo, 'update'>
        delete?: ValidateHook<ListTypeInfo, 'delete'>
      }

  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?:
    | BeforeOperationListHook<ListTypeInfo, 'create' | 'update' | 'delete'>
    | {
        create?: BeforeOperationListHook<ListTypeInfo, 'create'>
        update?: BeforeOperationListHook<ListTypeInfo, 'update'>
        delete?: BeforeOperationListHook<ListTypeInfo, 'delete'>
      }

  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?:
    | AfterOperationListHook<ListTypeInfo, 'create' | 'update' | 'delete'>
    | {
        create?: AfterOperationListHook<ListTypeInfo, 'create'>
        update?: AfterOperationListHook<ListTypeInfo, 'update'>
        delete?: AfterOperationListHook<ListTypeInfo, 'delete'>
      }
}

export type ResolvedListHooks<ListTypeInfo extends BaseListTypeInfo> = {
  transaction?: ResolvedTransactionHooks<
    Parameters<AfterOperationListHook<ListTypeInfo, 'create'>>[0],
    Parameters<AfterOperationListHook<ListTypeInfo, 'update'>>[0],
    Parameters<AfterOperationListHook<ListTypeInfo, 'delete'>>[0]
  >
  resolveInput: {
    create: ResolveInputListHook<ListTypeInfo, 'create'>
    update: ResolveInputListHook<ListTypeInfo, 'update'>
  }
  validate: {
    create: ValidateHook<ListTypeInfo, 'create'>
    update: ValidateHook<ListTypeInfo, 'update'>
    delete: ValidateHook<ListTypeInfo, 'delete'>
  }
  beforeOperation: {
    create: BeforeOperationListHook<ListTypeInfo, 'create'>
    update: BeforeOperationListHook<ListTypeInfo, 'update'>
    delete: BeforeOperationListHook<ListTypeInfo, 'delete'>
  }
  afterOperation: {
    create: AfterOperationListHook<ListTypeInfo, 'create'>
    update: AfterOperationListHook<ListTypeInfo, 'update'>
    delete: AfterOperationListHook<ListTypeInfo, 'delete'>
  }
}

export type FieldHooks<
  ListTypeInfo extends BaseListTypeInfo,
  FieldTypeInfo extends BaseFieldTypeInfo,
> = {
  /**
   * Per-write callbacks for explicit context.transaction() settlement only.
   * Receive snapshots with afterOperation's field argument shapes and a usable
   * non-transactional context. Create/update run for submitted fields; delete runs all fields.
   */
  transaction?: TransactionHooks<
    Parameters<AfterOperationFieldHook<ListTypeInfo, 'create', FieldTypeInfo>>[0],
    Parameters<AfterOperationFieldHook<ListTypeInfo, 'update', FieldTypeInfo>>[0],
    Parameters<AfterOperationFieldHook<ListTypeInfo, 'delete', FieldTypeInfo>>[0]
  >
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?:
    | ResolveInputFieldHook<ListTypeInfo, 'create' | 'update', FieldTypeInfo>
    | {
        create?: ResolveInputFieldHook<ListTypeInfo, 'create', FieldTypeInfo>
        update?: ResolveInputFieldHook<ListTypeInfo, 'update', FieldTypeInfo>
      }

  /**
   * Used to **validate** if a create, update or delete operation is OK
   */
  validate?:
    | ValidateFieldHook<ListTypeInfo, 'create' | 'update' | 'delete', FieldTypeInfo>
    | {
        create?: ValidateFieldHook<ListTypeInfo, 'create', FieldTypeInfo>
        update?: ValidateFieldHook<ListTypeInfo, 'update', FieldTypeInfo>
        delete?: ValidateFieldHook<ListTypeInfo, 'delete', FieldTypeInfo>
      }

  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?:
    | BeforeOperationFieldHook<ListTypeInfo, 'create' | 'update' | 'delete', FieldTypeInfo>
    | {
        create?: BeforeOperationFieldHook<ListTypeInfo, 'create', FieldTypeInfo>
        update?: BeforeOperationFieldHook<ListTypeInfo, 'update', FieldTypeInfo>
        delete?: BeforeOperationFieldHook<ListTypeInfo, 'delete', FieldTypeInfo>
      }

  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?:
    | AfterOperationFieldHook<ListTypeInfo, 'create' | 'update' | 'delete', FieldTypeInfo>
    | {
        create?: AfterOperationFieldHook<ListTypeInfo, 'create', FieldTypeInfo>
        update?: AfterOperationFieldHook<ListTypeInfo, 'update', FieldTypeInfo>
        delete?: AfterOperationFieldHook<ListTypeInfo, 'delete', FieldTypeInfo>
      }
}

export type ResolvedFieldHooks<
  ListTypeInfo extends BaseListTypeInfo,
  FieldTypeInfo extends BaseFieldTypeInfo,
> = {
  transaction?: ResolvedTransactionHooks<
    Parameters<AfterOperationFieldHook<ListTypeInfo, 'create', FieldTypeInfo>>[0],
    Parameters<AfterOperationFieldHook<ListTypeInfo, 'update', FieldTypeInfo>>[0],
    Parameters<AfterOperationFieldHook<ListTypeInfo, 'delete', FieldTypeInfo>>[0]
  >
  resolveInput: {
    create: ResolveInputFieldHook<ListTypeInfo, 'create', FieldTypeInfo>
    update: ResolveInputFieldHook<ListTypeInfo, 'update', FieldTypeInfo>
  }
  validate: {
    create: ValidateFieldHook<ListTypeInfo, 'create', FieldTypeInfo>
    update: ValidateFieldHook<ListTypeInfo, 'update', FieldTypeInfo>
    delete: ValidateFieldHook<ListTypeInfo, 'delete', FieldTypeInfo>
  }
  beforeOperation: {
    create: BeforeOperationFieldHook<ListTypeInfo, 'create', FieldTypeInfo>
    update: BeforeOperationFieldHook<ListTypeInfo, 'update', FieldTypeInfo>
    delete: BeforeOperationFieldHook<ListTypeInfo, 'delete', FieldTypeInfo>
  }
  afterOperation: {
    create: AfterOperationFieldHook<ListTypeInfo, 'create', FieldTypeInfo>
    update: AfterOperationFieldHook<ListTypeInfo, 'update', FieldTypeInfo>
    delete: AfterOperationFieldHook<ListTypeInfo, 'delete', FieldTypeInfo>
  }
}

type ResolveInputFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update',
  FieldTypeInfo extends BaseFieldTypeInfo,
> = (
  args: {
    create: {
      operation: 'create'
      itemField: undefined
      item: undefined
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create']
      inputFieldData: FieldTypeInfo['inputs']['create']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create']
      resolvedFieldData: FieldTypeInfo['prisma']['create']
    }
    update: {
      operation: 'update'
      itemField: FieldTypeInfo['item']
      item: ListTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update']
      inputFieldData: FieldTypeInfo['inputs']['update']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update']
      resolvedFieldData: FieldTypeInfo['prisma']['update']
    }
  }[Operation] &
    CommonArgs<ListTypeInfo> & { fieldKey: ListTypeInfo['fields'] }
) => MaybePromise<
  FieldTypeInfo['prisma']['update'] | undefined // undefined represents 'don't do anything'
>

export type ValidateHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete',
> = (
  args: {
    create: {
      operation: 'create'
      item: undefined
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create']
      addValidationError: (error: string) => void
    }
    update: {
      operation: 'update'
      item: ListTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update']
      addValidationError: (error: string) => void
    }
    delete: {
      operation: 'delete'
      item: ListTypeInfo['item']
      inputData: undefined // TODO: remove?
      resolvedData: undefined // TODO: remove?
      addValidationError: (error: string) => void
    }
  }[Operation] &
    CommonArgs<ListTypeInfo>
) => MaybePromise<void>

export type ValidateFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete',
  FieldTypeInfo extends BaseFieldTypeInfo,
> = (
  args: {
    create: {
      operation: 'create'
      item: undefined
      itemField: undefined
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create']
      inputFieldData: FieldTypeInfo['inputs']['create']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create']
      resolvedFieldData: FieldTypeInfo['prisma']['create']
    }
    update: {
      operation: 'update'
      item: ListTypeInfo['item']
      itemField: FieldTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update']
      inputFieldData: FieldTypeInfo['inputs']['update']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update']
      resolvedFieldData: FieldTypeInfo['prisma']['update']
    }
    delete: {
      operation: 'delete'
      item: ListTypeInfo['item']
      itemField: FieldTypeInfo['item']
      inputData: undefined
      inputFieldData: undefined
      resolvedData: undefined
      resolvedFieldData: undefined
    }
  }[Operation] &
    CommonArgs<ListTypeInfo> & {
      fieldKey: ListTypeInfo['fields']
      addValidationError: (error: string) => void
    }
) => MaybePromise<void>

type BeforeOperationListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete',
> = (
  args: {
    create: {
      operation: 'create'
      item: undefined
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create']

      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create']
    }
    update: {
      operation: 'update'
      item: ListTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update']
    }
    delete: {
      operation: 'delete'
      item: ListTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: undefined
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: undefined
    }
  }[Operation] &
    CommonArgs<ListTypeInfo>
) => MaybePromise<void>

type BeforeOperationFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete',
  FieldTypeInfo extends BaseFieldTypeInfo,
> = (
  args: {
    create: {
      operation: 'create'
      item: undefined
      itemField: undefined
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create']
      inputFieldData: FieldTypeInfo['inputs']['create']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create']
      resolvedFieldData: FieldTypeInfo['prisma']['create']
    }
    update: {
      operation: 'update'
      item: ListTypeInfo['item']
      itemField: FieldTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update']
      inputFieldData: FieldTypeInfo['inputs']['update']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update']
      resolvedFieldData: FieldTypeInfo['prisma']['update']
    }
    delete: {
      operation: 'delete'
      item: ListTypeInfo['item']
      itemField: FieldTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: undefined
      inputFieldData: undefined
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: undefined
      resolvedFieldData: undefined
    }
  }[Operation] &
    CommonArgs<ListTypeInfo> & { fieldKey: ListTypeInfo['fields'] }
) => MaybePromise<void>

type AfterOperationListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete',
> = (
  args: {
    create: {
      operation: 'create'
      originalItem: undefined
      item: ListTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create']
    }
    update: {
      operation: 'update'
      originalItem: ListTypeInfo['item']
      item: ListTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update']
    }
    delete: {
      operation: 'delete'
      originalItem: ListTypeInfo['item']
      item: undefined
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: undefined
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: undefined
    }
  }[Operation] &
    CommonArgs<ListTypeInfo>
) => MaybePromise<void>

type AfterOperationFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete',
  FieldTypeInfo extends BaseFieldTypeInfo,
> = (
  args: {
    create: {
      operation: 'create'
      originalItem: undefined
      originalItemField: undefined
      item: ListTypeInfo['item']
      itemField: FieldTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['create']
      inputFieldData: FieldTypeInfo['inputs']['create']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['create']
      resolvedFieldData: FieldTypeInfo['prisma']['create']
    }
    update: {
      operation: 'update'
      originalItem: ListTypeInfo['item']
      originalItemField: FieldTypeInfo['item']
      item: ListTypeInfo['item']
      itemField: FieldTypeInfo['item']
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: ListTypeInfo['inputs']['update']
      inputFieldData: FieldTypeInfo['inputs']['update']
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: ListTypeInfo['prisma']['update']
      resolvedFieldData: FieldTypeInfo['prisma']['update']
    }
    delete: {
      operation: 'delete'
      originalItem: ListTypeInfo['item']
      originalItemField: FieldTypeInfo['item']
      item: undefined
      itemField: undefined
      /**
       * The GraphQL input **before** default values are applied
       */
      inputData: undefined
      inputFieldData: undefined
      /**
       * The GraphQL input **after** being resolved by the field type's input resolver
       */
      resolvedData: undefined
      resolvedFieldData: undefined
    }
  }[Operation] &
    CommonArgs<ListTypeInfo> & { fieldKey: ListTypeInfo['fields'] }
) => MaybePromise<void>
