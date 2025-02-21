import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
} from '@keystone-6/core/types'
import { g } from '@keystone-6/core'

type PairFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<ListTypeInfo>

type PairInput = {
  left: string | null | undefined
  right: string | null | undefined
}
type PairOutput = PairInput

const PairInput = g.inputObject({
  name: 'PairNestedInput',
  fields: {
    left: g.arg({ type: g.String }),
    right: g.arg({ type: g.String }),
  },
})

const PairOutput = g.object<PairOutput>()({
  name: 'PairNestedOutput',
  fields: {
    left: g.field({ type: g.String }),
    right: g.field({ type: g.String }),
  },
})

const PairFilter = g.inputObject({
  name: 'PairNestedFilter',
  fields: {
    equals: g.arg({
      type: PairInput,
    }),
  },
})

export function pair<ListTypeInfo extends BaseListTypeInfo>(
  config: PairFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  function resolveInput(value: PairInput | null | undefined) {
    if (!value) return { left: value, right: value }
    const { left = null, right = null } = value ?? {}
    return { left, right }
  }

  function resolveOutput(value: PairOutput) {
    return value
  }

  function resolveWhere(value: null | { equals: PairInput | null | undefined }) {
    if (value === null) throw new Error('PairFilter cannot be null')
    if (value.equals === undefined) return {}
    const { left, right } = resolveInput(value.equals)
    return {
      left: { equals: left },
      right: { equals: right },
    }
  }

  return meta =>
    fieldType({
      kind: 'multi',
      fields: {
        left: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'String',
        },
        right: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'String',
        },
      },
    })({
      ...config,
      input: {
        where: {
          arg: g.arg({ type: PairFilter }),
          resolve(value, context) {
            return resolveWhere(value)
          },
        },
        create: {
          arg: g.arg({ type: PairInput }),
          resolve(value, context) {
            return resolveInput(value)
          },
        },
        update: {
          arg: g.arg({ type: PairInput }),
          resolve(value, context) {
            return resolveInput(value)
          },
        },
      },
      output: g.field({
        type: PairOutput,
        resolve({ value, item }, args, context, info) {
          return resolveOutput(value)
        },
      }),
      views: './3-pair-field-nested/views',
      getAdminMeta() {
        return {}
      },
    })
}
