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

type PairInput = {
  left: string | null | undefined
  right: string | null | undefined
}
type PairOutput = PairInput

const PairInput = g.inputObject({
  name: 'PairJsonInput',
  fields: {
    left: g.arg({ type: g.String }),
    right: g.arg({ type: g.String }),
  },
})

const PairOutput = g.object<PairOutput>()({
  name: 'PairJsonOutput',
  fields: {
    left: g.field({ type: g.String }),
    right: g.field({ type: g.String }),
  },
})

const PairFilter = g.inputObject({
  name: 'PairJsonFilter',
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
    if (value === undefined) return undefined
    const { left = null, right = null } = value ?? {}
    return JSON.stringify({ left, right })
  }

  function resolveOutput(value: string | null) {
    if (value === null) return { left: null, right: null }
    return JSON.parse(value) as PairOutput
  }

  function resolveWhere(value: null | { equals: PairInput | null | undefined }) {
    if (value === null) throw new Error('PairFilter cannot be null')
    if (value.equals === undefined) return {}
    const json = resolveInput(value.equals)
    return { equals: json }
  }

  return meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      // we should use 'Json', but it's complicated with sqlite
      //   we are using String for the example
      scalar: 'String',
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
      views: './3-pair-field-json/views',
      getAdminMeta() {
        return {} satisfies Parameters<typeof controller>[0]['fieldMeta']
      },
    })
}
