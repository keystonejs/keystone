import type { MaybePromise } from '@keystone-6/core/types'
import { selectItem } from '@keystone-6/core'

function mergeVoidFn<
  Args,
  A extends ((args: Args) => MaybePromise<void>) | undefined,
  B extends ((args: Args) => MaybePromise<void>) | undefined,
>(a: A, b: B) {
  if (!a) return b
  if (!b) return a
  return selectItem.wrap(
    (first, second) => async args => {
      await first?.(args)
      await second?.(args)
    },
    {},
    a,
    b
  )
}

type ExpandedHooks<CreateArgs, UpdateArgs, DeleteArgs> = {
  create?: (args: CreateArgs) => MaybePromise<void>
  update?: (args: UpdateArgs) => MaybePromise<void>
  delete?: (args: DeleteArgs) => MaybePromise<void>
}

type Hooks<CreateArgs, UpdateArgs, DeleteArgs> =
  | ((args: CreateArgs | UpdateArgs | DeleteArgs) => MaybePromise<void>)
  | ExpandedHooks<CreateArgs, UpdateArgs, DeleteArgs>

export function merge<CreateArgs, UpdateArgs, DeleteArgs>(
  a: Hooks<CreateArgs, UpdateArgs, DeleteArgs> | undefined,
  b: Hooks<CreateArgs, UpdateArgs, DeleteArgs> | undefined
): Hooks<CreateArgs, UpdateArgs, DeleteArgs> | undefined {
  if (!a) return b
  if (!b) return a
  if (typeof a === 'function' && typeof b === 'function') {
    return mergeVoidFn(a, b)
  }
  const expandedA = expandHooks(a)
  const expandedB = expandHooks(b)
  return {
    create: mergeVoidFn(expandedA.create, expandedB.create),
    update: mergeVoidFn(expandedA.update, expandedB.update),
    delete: mergeVoidFn(expandedA.delete, expandedB.delete),
  }
}

function expandHooks<CreateArgs, UpdateArgs, DeleteArgs>(
  fn: Hooks<CreateArgs, UpdateArgs, DeleteArgs>
): ExpandedHooks<CreateArgs, UpdateArgs, DeleteArgs> {
  return typeof fn === 'function' ? { create: fn, update: fn, delete: fn } : fn
}
