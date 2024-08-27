import {
  type KeystoneContextFromListTypeInfo,
  type MaybePromise
} from '..'
import {
  type BaseListTypeInfo
} from '../type-info'

type CommonArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: KeystoneContextFromListTypeInfo<ListTypeInfo>
  /**
   * The key of the list that the operation is occurring on
   */
  listKey: ListTypeInfo['key']
}

type ResolveInputListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update'
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
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?: {
    create?: ResolveInputListHook<ListTypeInfo, 'create'>
    update?: ResolveInputListHook<ListTypeInfo, 'update'>
  }

  /**
   * Used to **validate** if a create, update or delete operation is OK
   */
  validate?: {
    create?: ValidateHook<ListTypeInfo, 'create'>
    update?: ValidateHook<ListTypeInfo, 'update'>
    delete?: ValidateHook<ListTypeInfo, 'delete'>
  }

  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: {
    create?: BeforeOperationListHook<ListTypeInfo, 'create'>
    update?: BeforeOperationListHook<ListTypeInfo, 'update'>
    delete?: BeforeOperationListHook<ListTypeInfo, 'delete'>
  }

  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: {
    create?: AfterOperationListHook<ListTypeInfo, 'create'>
    update?: AfterOperationListHook<ListTypeInfo, 'update'>
    delete?: AfterOperationListHook<ListTypeInfo, 'delete'>
  }
}

export type ResolvedListHooks<ListTypeInfo extends BaseListTypeInfo> = {
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
  FieldKey extends ListTypeInfo['fields'] = ListTypeInfo['fields']
> = {
  /**
   * Used to **modify the input** for create and update operations after default values and access control have been applied
   */
  resolveInput?: {
    create?: ResolveInputFieldHook<ListTypeInfo, 'create', FieldKey>
    update?: ResolveInputFieldHook<ListTypeInfo, 'update', FieldKey>
  }    

  /**
   * Used to **validate** if a create, update or delete operation is OK
   */
  validate?: {
    create?: ValidateFieldHook<ListTypeInfo, 'create', FieldKey>
    update?: ValidateFieldHook<ListTypeInfo, 'update', FieldKey>
    delete?: ValidateFieldHook<ListTypeInfo, 'delete', FieldKey>
  }

  /**
   * Used to **cause side effects** before a create, update, or delete operation once all validateInput hooks have resolved
   */
  beforeOperation?: {
    create?: BeforeOperationFieldHook<ListTypeInfo, 'create', FieldKey>
    update?: BeforeOperationFieldHook<ListTypeInfo, 'update', FieldKey>
    delete?: BeforeOperationFieldHook<ListTypeInfo, 'delete', FieldKey>
  }

  /**
   * Used to **cause side effects** after a create, update, or delete operation operation has occurred
   */
  afterOperation?: {
    create?: AfterOperationFieldHook<ListTypeInfo, 'create', FieldKey>
    update?: AfterOperationFieldHook<ListTypeInfo, 'update', FieldKey>
    delete?: AfterOperationFieldHook<ListTypeInfo, 'delete', FieldKey>
  }
}

export type ResolvedFieldHooks<
  ListTypeInfo extends BaseListTypeInfo,
  FieldKey extends ListTypeInfo['fields'] = ListTypeInfo['fields']
> = {
  resolveInput: {
    create: ResolveInputFieldHook<ListTypeInfo, 'create', FieldKey>
    update: ResolveInputFieldHook<ListTypeInfo, 'update', FieldKey>
  }
  validate: {
    create: ValidateFieldHook<ListTypeInfo, 'create', FieldKey>
    update: ValidateFieldHook<ListTypeInfo, 'update', FieldKey>
    delete: ValidateFieldHook<ListTypeInfo, 'delete', FieldKey>
  }
  beforeOperation: {
    create: BeforeOperationFieldHook<ListTypeInfo, 'create', FieldKey>
    update: BeforeOperationFieldHook<ListTypeInfo, 'update', FieldKey>
    delete: BeforeOperationFieldHook<ListTypeInfo, 'delete', FieldKey>
  }
  afterOperation: {
    create: AfterOperationFieldHook<ListTypeInfo, 'create', FieldKey>
    update: AfterOperationFieldHook<ListTypeInfo, 'update', FieldKey>
    delete: AfterOperationFieldHook<ListTypeInfo, 'delete', FieldKey>
  }
}

type ResolveInputFieldHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update',
  FieldKey extends ListTypeInfo['fields']
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
    CommonArgs<ListTypeInfo> & { fieldKey: FieldKey }
) => MaybePromise<
  ListTypeInfo['prisma']['create' | 'update'][FieldKey] | undefined // undefined represents 'don't do anything'
>

export type ValidateHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete'
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
  FieldKey extends ListTypeInfo['fields']
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
      inputData: undefined
      resolvedData: undefined
    }
  }[Operation] &
    CommonArgs<ListTypeInfo> & {
      fieldKey: FieldKey
      addValidationError: (error: string) => void
    }
) => MaybePromise<void>

type BeforeOperationListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete'
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
  FieldKey extends ListTypeInfo['fields']
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
    CommonArgs<ListTypeInfo> & { fieldKey: FieldKey }
) => MaybePromise<void>

type AfterOperationListHook<
  ListTypeInfo extends BaseListTypeInfo,
  Operation extends 'create' | 'update' | 'delete'
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
  FieldKey extends ListTypeInfo['fields']
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
    CommonArgs<ListTypeInfo> & { fieldKey: FieldKey }
) => MaybePromise<void>
