import type { MaybePromise } from '../types/index.ts'
import {
  callbackWithoutItem,
  combineCallbackFields,
  type ItemCallback,
} from '../types/item-callback.ts'

function mergeVoidFn<
  Args,
  A extends ItemCallback<(args: Args) => MaybePromise<void>> | undefined,
  B extends ItemCallback<(args: Args) => MaybePromise<void>> | undefined,
>(a: A, b: B) {
  if (!a) return b
  if (!b) return a
  const first = a
  const second = b
  return combineCallbackFields(
    async (args: Args) => {
      await first(args)
      await second(args)
    },
    first,
    second
  )
}

type ExpandedHooks<CreateArgs, UpdateArgs, DeleteArgs> = {
  create?: ItemCallback<(args: CreateArgs) => MaybePromise<void>>
  update?: ItemCallback<(args: UpdateArgs) => MaybePromise<void>>
  delete?: ItemCallback<(args: DeleteArgs) => MaybePromise<void>>
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

const emptyFn = callbackWithoutItem(() => {})

export function expandVoidHooks<CreateArgs, UpdateArgs, DeleteArgs>(
  hooks: Hooks<CreateArgs, UpdateArgs, DeleteArgs> | undefined
): {
  create: (args: CreateArgs) => MaybePromise<void>
  update: (args: UpdateArgs) => MaybePromise<void>
  delete: (args: DeleteArgs) => MaybePromise<void>
} {
  const expanded = hooks ? expandHooks(hooks) : {}
  return {
    create: expanded.create ?? emptyFn,
    update: expanded.update ?? emptyFn,
    delete: expanded.delete ?? emptyFn,
  }
}
