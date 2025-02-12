import {  type MaybePromise } from '../types'

function mergeVoidFn <
  Args,
  A extends ((args: Args) => MaybePromise<void>) | undefined,
  B extends ((args: Args) => MaybePromise<void>) | undefined
> (a: A, b: B) {
  if (!a) return b
  if (!b) return a
  return async (args: Args) => {
    await a?.(args)
    await b?.(args)
  }
}

type ExpandedHooks<CreateArgs, UpdateArgs, DeleteArgs> = {
  create?: (args: CreateArgs) => MaybePromise<void>
  update?: (args: UpdateArgs) => MaybePromise<void>
  delete?: (args: DeleteArgs) => MaybePromise<void>
}

type Hooks<CreateArgs, UpdateArgs, DeleteArgs> =
  | ((args: CreateArgs | UpdateArgs | DeleteArgs) => MaybePromise<void>)
  | ExpandedHooks<CreateArgs, UpdateArgs, DeleteArgs>

export function merge<CreateArgs, UpdateArgs, DeleteArgs> (
  a: Hooks<CreateArgs, UpdateArgs, DeleteArgs> | undefined,
  b: Hooks<CreateArgs, UpdateArgs, DeleteArgs> | undefined,
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

function expandHooks<CreateArgs, UpdateArgs, DeleteArgs> (
  fn: Hooks<CreateArgs, UpdateArgs, DeleteArgs>,
): ExpandedHooks<CreateArgs, UpdateArgs, DeleteArgs> {
  return typeof fn === 'function'
    ? { create: fn, update: fn, delete: fn }
    : (fn)
}

const emptyFn = () => {}

export function expandVoidHooks<CreateArgs, UpdateArgs, DeleteArgs> (
  hooks: Hooks<CreateArgs, UpdateArgs, DeleteArgs> | undefined,
): Required<ExpandedHooks<CreateArgs, UpdateArgs, DeleteArgs>> {
  const expanded = hooks ? expandHooks(hooks) : {}
  return {
    create: expanded.create ?? emptyFn,
    update: expanded.update ?? emptyFn,
    delete: expanded.delete ?? emptyFn
  }
}