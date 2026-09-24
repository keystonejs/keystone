import { describe, expect, test } from 'vitest'
import { g, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, integer, json, text } from '@keystone-6/core/fields'
import {
  fieldType,
  type BaseListTypeInfo,
  type FieldTypeFunc,
  type KeystoneContext,
} from '@keystone-6/core/types'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'

type HookInput = {
  inputData: Record<string, unknown>
  resolvedData: Record<string, unknown>
  inputFieldData?: unknown
  resolvedFieldData?: unknown
}

type Observation = { stage: string } & Partial<HookInput>
const observations: Observation[] = []

function record(stage: string, args: HookInput) {
  observations.push({
    stage,
    ...structuredClone({
      inputData: args.inputData,
      resolvedData: args.resolvedData,
      inputFieldData: args.inputFieldData,
      resolvedFieldData: args.resolvedFieldData,
    }),
  })
}

// Capture the real input-resolver and hook arguments without changing their values.
const observedText: FieldTypeFunc<BaseListTypeInfo> = () =>
  fieldType({ kind: 'scalar', scalar: 'String', mode: 'optional' })({
    input: {
      create: { arg: g.arg({ type: g.String }) },
      update: {
        arg: g.arg({ type: g.String }),
        resolve(value) {
          observations.push({ stage: 'input.update', inputFieldData: value })
          return value
        },
      },
    },
    output: g.field({ type: g.String }),
    views: '@keystone-6/core/fields/types/text/views',
    hooks: {
      resolveInput: {
        update: args => {
          record('field.resolveInput', args)
          return args.resolvedFieldData
        },
      },
      validate: { update: args => record('field.validate', args) },
      beforeOperation: { update: args => record('field.beforeOperation', args) },
      afterOperation: { update: args => record('field.afterOperation', args) },
    },
  })

const pairInput = g.inputObject({
  name: 'InputSemanticsPairInput',
  fields: {
    left: g.arg({ type: g.String }),
    right: g.arg({ type: g.String }),
  },
})

// Model both no-op representations used by custom multi-column fields.
function pair(emptyPatch: boolean): FieldTypeFunc<BaseListTypeInfo> {
  return () => {
    function resolve(value: { left?: string | null; right?: string | null } | null | undefined) {
      if (value === undefined) {
        // The runtime accepts an empty patch, but the resolver type requires all keys.
        return emptyPatch
          ? ({} as { left: undefined; right: undefined })
          : { left: undefined, right: undefined }
      }
      if (value === null) return { left: null, right: null }
      return { left: value.left, right: value.right }
    }

    return fieldType({
      kind: 'multi',
      fields: {
        left: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        right: { kind: 'scalar', scalar: 'String', mode: 'optional' },
      },
    })({
      input: {
        create: { arg: g.arg({ type: pairInput }), resolve },
        update: { arg: g.arg({ type: pairInput }), resolve },
      },
      output: g.field({ type: g.JSON }),
      views: '@keystone-6/core/fields/types/json/views',
    })
  }
}

const runner = setupTestRunner({
  config: {
    lists: {
      InputRecord: list({
        access: allowAll,
        fields: {
          name: text(),
          value: observedText,
          enabled: checkbox(),
          count: integer(),
          payload: json({ defaultValue: { source: 'default' } }),
          pairEmpty: pair(true),
          pairUndefined: pair(false),
          touched: integer({
            defaultValue: 0,
            hooks: {
              resolveInput: {
                update: ({ resolvedFieldData, itemField }) =>
                  resolvedFieldData === undefined ? itemField! + 1 : resolvedFieldData,
              },
            },
          }),
        },
        hooks: {
          resolveInput: {
            update: args => {
              record('list.resolveInput', args)
              return args.resolvedData
            },
          },
          validate: { update: args => record('list.validate', args) },
          beforeOperation: {
            update: args => record('list.beforeOperation', args),
          },
          afterOperation: {
            update: args => record('list.afterOperation', args),
          },
        },
      }),
    },
  },
})

const selection = 'id name value enabled count payload pairEmpty pairUndefined touched'
type Api = 'db' | 'query' | 'graphql'

async function update(
  context: KeystoneContext,
  api: Api,
  id: string,
  data: Record<string, unknown>
) {
  if (api === 'graphql') {
    await context.graphql.run({
      query: `mutation ($id: ID!, $data: InputRecordUpdateInput!) {
        updateInputRecord(where: { id: $id }, data: $data) { id }
      }`,
      variables: { id, data },
    })
  } else {
    await context[api].InputRecord.updateOne({ where: { id }, data })
  }
  return context.query.InputRecord.findOne({
    where: { id },
    query: selection,
  })
}

async function seed(context: KeystoneContext) {
  const item = await context.query.InputRecord.createOne({
    data: {
      name: 'before',
      value: 'preserve',
      enabled: true,
      count: 7,
      payload: { source: 'stored' },
      pairEmpty: { left: 'left', right: 'right' },
      pairUndefined: { left: 'left', right: 'right' },
    },
    query: selection,
  })
  observations.length = 0
  return item
}

for (const api of ['db', 'query', 'graphql'] as const) {
  describe(`mutation input semantics (${api})`, () => {
    for (const explicitUndefined of api === 'graphql' ? [false] : [false, true]) {
      test(
        explicitUndefined
          ? 'undefined input behaves like omission'
          : 'omitted fields retain their values',
        runner(async ({ context }) => {
          const before = await seed(context)
          const after = await update(context, api, before.id, {
            name: 'after',
            ...(explicitUndefined
              ? {
                  value: undefined,
                  pairEmpty: undefined,
                  pairUndefined: undefined,
                }
              : {}),
          })
          expect(after).toEqual({ ...before, name: 'after', touched: 1 })
          expect(observations.find(x => x.stage === 'input.update')).toStrictEqual({
            stage: 'input.update',
            inputFieldData: undefined,
          })
          expect(observations.map(x => x.stage)).toEqual([
            'input.update',
            'field.resolveInput',
            'list.resolveInput',
            'field.validate',
            'list.validate',
            'list.beforeOperation',
            'list.afterOperation',
          ])
          for (const observation of observations.filter(x => x.resolvedData)) {
            expect(Object.hasOwn(observation.inputData!, 'value')).toBe(false)
            expect(Object.hasOwn(observation.resolvedData!, 'value')).toBe(true)
            expect(observation.resolvedData!.value).toBeUndefined()
            expect(observation.resolvedData!.pairEmpty).toStrictEqual({})
            expect(observation.resolvedData!.pairUndefined).toStrictEqual({
              left: undefined,
              right: undefined,
            })
          }
        })
      )
    }

    for (const [field, value] of [
      ['value', null],
      ['value', ''],
      ['enabled', false],
      ['count', 0],
      ['payload', []],
    ] as const) {
      test(
        `preserves explicit ${JSON.stringify(value)} for ${field}`,
        runner(async ({ context }) => {
          const before = await seed(context)
          const after = await update(context, api, before.id, {
            [field]: value,
          })
          expect(after).toEqual({ ...before, [field]: value, touched: 1 })
          const args = observations.find(x => x.stage === 'list.resolveInput')!
          expect(Object.hasOwn(args.inputData!, field)).toBe(true)
          expect(args.inputData![field]).toStrictEqual(value)
          expect(args.resolvedData![field]).toStrictEqual(value)
          if (field === 'value') {
            expect(observations.map(x => x.stage)).toContain('field.beforeOperation')
            expect(observations.map(x => x.stage)).toContain('field.afterOperation')
          }
        })
      )
    }

    test(
      'explicit null clears the custom multi-column fields',
      runner(async ({ context }) => {
        const before = await seed(context)
        const after = await update(context, api, before.id, {
          pairEmpty: null,
          pairUndefined: null,
        })
        expect(after).toEqual({
          ...before,
          pairEmpty: { left: null, right: null },
          pairUndefined: { left: null, right: null },
          touched: 1,
        })
      })
    )

    test(
      'applies create defaults without reapplying them on unrelated updates',
      runner(async ({ context }) => {
        const created = await context.query.InputRecord.createOne({
          data: {},
          query: selection,
        })
        expect(created.payload).toStrictEqual({ source: 'default' })
        await update(context, api, created.id, {
          payload: { source: 'changed' },
        })
        const after = await update(context, api, created.id, { name: 'after' })
        expect(after.payload).toStrictEqual({ source: 'changed' })
      })
    )

    test(
      'allows a field hook to deliberately update an omitted field',
      runner(async ({ context }) => {
        const before = await seed(context)
        const after = await update(context, api, before.id, {})
        expect(after).toEqual({ ...before, touched: 1 })
        const args = observations.find(x => x.stage === 'list.resolveInput')!
        expect(Object.hasOwn(args.inputData!, 'touched')).toBe(false)
        expect(args.resolvedData!.touched).toBe(1)
      })
    )
  })
}
