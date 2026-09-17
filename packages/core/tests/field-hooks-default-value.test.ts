import { describe, expect, test, vi } from 'vitest'
import type { InitialisedList } from '../src/lib/core/initialise-lists.ts'
import { runSideEffectOnlyHook } from '../src/lib/core/hooks.ts'

function makeList(fieldHook: (args: any) => void | Promise<void>) {
  const noop = () => {}
  return {
    listKey: 'Material',
    fields: {
      order: {
        hooks: {
          beforeOperation: { create: fieldHook, update: fieldHook, delete: fieldHook },
          afterOperation: { create: fieldHook, update: fieldHook, delete: fieldHook },
        },
      },
    },
    hooks: {
      beforeOperation: { create: noop, update: noop, delete: noop },
      afterOperation: { create: noop, update: noop, delete: noop },
    },
  } as unknown as InitialisedList
}

function makeArgs(inputData: Record<string, unknown>, resolvedData: Record<string, unknown>) {
  return {
    operation: 'create',
    listKey: 'Material',
    context: {},
    item: undefined,
    inputData,
    resolvedData,
  } as any
}

// https://github.com/keystonejs/keystone/issues/9382
// field hooks must run when a field resolves to a value it was not
//   explicitly given, eg. an integer field using its defaultValue
describe('field beforeOperation/afterOperation with default values', () => {
  for (const hookName of ['beforeOperation', 'afterOperation'] as const) {
    test(`${hookName} runs for a defaulted field missing from inputData`, async () => {
      const fieldHook = vi.fn()
      await runSideEffectOnlyHook(makeList(fieldHook), hookName, makeArgs({}, { order: 1 }))
      expect(fieldHook).toHaveBeenCalledTimes(1)
    })

    test(`${hookName} still runs for an explicitly provided field`, async () => {
      const fieldHook = vi.fn()
      await runSideEffectOnlyHook(
        makeList(fieldHook),
        hookName,
        makeArgs({ order: 2 }, { order: 2 })
      )
      expect(fieldHook).toHaveBeenCalledTimes(1)
    })

    test(`${hookName} is skipped for a field with no input and no resolved value`, async () => {
      const fieldHook = vi.fn()
      await runSideEffectOnlyHook(makeList(fieldHook), hookName, makeArgs({}, {}))
      expect(fieldHook).not.toHaveBeenCalled()
    })
  }
})
