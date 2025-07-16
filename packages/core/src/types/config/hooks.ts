import type { BaseFieldTypeInfo, KeystoneContextFromListTypeInfo, MaybePromise } from '..'
import type { BaseListTypeInfo } from '../type-info'

type CommonArgs<ListTypeInfo extends BaseListTypeInfo> = {
  context: KeystoneContextFromListTypeInfo<ListTypeInfo>
  /**
   * The key of the list that the operation is occurring on
   */
  listKey: ListTypeInfo['key']
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
