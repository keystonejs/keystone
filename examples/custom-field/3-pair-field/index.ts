import {
  BaseFieldTypeInfo,
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
} from '@keystone-6/core/types'
import { g } from '@keystone-6/core'
import { controller } from './views'

type PairFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  BaseFieldTypeInfo // TODO
>

type PairInput = string
type PairOutput = string

const PairInput = g.String
const PairOutput = g.String

const PairFilter = g.inputObject({
  name: 'PairFilter',
  fields: {
    equals: g.arg({ type: g.String }),
  },
})

export function pair<ListTypeInfo extends BaseListTypeInfo>(
  config: PairFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  function resolveInput(value: PairInput | null | undefined) {
    if (!value) return { left: value, right: value }
    const [left = '', right = ''] = value.split(' ', 2)
    return {
      left,
      right,
    }
  }

  function resolveOutput(value: { left: string | null; right: string | null }) {
    const { left, right } = value
    if (left === null || right === null) return null
    return `${left} ${right}`
  }

  function resolveWhere(value: null | { equals: string | null | undefined }) {
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
      views: './3-pair-field/views',
      getAdminMeta(): Parameters<typeof controller>[0]['fieldMeta'] {
        return {}
      },
    })
}
