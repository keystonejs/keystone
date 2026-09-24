import type { FieldSelection, SelectedItem } from './item-selection.ts'

type ItemFromArgs<Args> = Args extends { item: unknown } | { originalItem: unknown }
  ?
      | NonNullable<Args extends { item: infer Item } ? Item : never>
      | NonNullable<Args extends { originalItem: infer Item } ? Item : never>
  : Args extends { results: infer Results }
    ? Results extends readonly (infer Item)[]
      ? Item
      : never
    : Args

type SelectedArgs<Args, Selection> = Args extends
  | { item: unknown }
  | { originalItem: unknown }
  | { results: unknown }
  ? {
      [Key in keyof Args]: Key extends 'item' | 'originalItem'
        ? SelectedItem<Args[Key], Selection>
        : Key extends 'results'
          ? Args[Key] extends (infer Item)[]
            ? SelectedItem<Item, Selection>[]
            : Args[Key]
          : Args[Key]
    }
  : SelectedItem<Args, Selection>

type Tail<Args extends unknown[]> = Args extends [unknown, ...infer Rest] ? Rest : never

type SelectedFunction<Fn extends (arg: any, ...rest: any[]) => any, Selection> = (
  arg: SelectedArgs<Parameters<Fn>[0], Selection>,
  ...rest: Tail<Parameters<Fn>>
) => ReturnType<Fn>

export type ItemCallback<Fn extends (...args: any[]) => any> = Fn

const callbackSelections = new WeakMap<Function, Readonly<Record<string, true | undefined>>>()
const callbacksWithoutItem = new WeakSet<Function>()

/** Declare the item columns read by a callback. `id` is always available. */
export function selectFields<
  Fn extends (arg: any, ...rest: any[]) => any,
  const Selection extends FieldSelection<ItemFromArgs<Parameters<Fn>[0]>>,
>(fn: SelectedFunction<Fn, Selection>, select: Selection): Fn {
  const wrapped = function (this: unknown, ...args: Parameters<Fn>) {
    return Reflect.apply(fn, this, args)
  } as Fn
  callbackSelections.set(wrapped, select)
  return wrapped
}
/** Wrap callbacks while selecting the columns read by the wrapper and its source callbacks. */
export function wrapItemCallback<
  Fns extends ReadonlyArray<Function | undefined>,
  Args extends [arg: any, ...rest: any[]],
  Result,
  const Selection extends FieldSelection<ItemFromArgs<Args[0]>>,
>(
  wrapper: (...fns: Fns) => (...args: Args) => Result,
  select: Selection,
  ...fns: Fns
): (...args: Args) => Result {
  const wrapped = wrapper(...fns)
  const combined: Record<string, true | undefined> = {}
  for (const fn of fns) {
    if (!fn) continue
    const inherited = getCallbackSelection(fn)
    if (inherited === 'all') return wrapped
    Object.assign(combined, inherited)
  }
  callbackSelections.set(wrapped, { ...combined, ...select })
  return wrapped
}

export function callbackWithoutItem<Fn extends Function>(fn: Fn): Fn {
  callbacksWithoutItem.add(fn)
  callbackSelections.set(fn, {})
  return fn
}

export function callbackReadsItemField(callback: Function) {
  return !callbacksWithoutItem.has(callback)
}

export function combineCallbackFields<Fn extends Function>(
  fn: Fn,
  first: Function,
  second: Function
): Fn {
  const firstFields = getCallbackSelection(first)
  const secondFields = getCallbackSelection(second)
  if (firstFields !== 'all' && secondFields !== 'all') {
    const fields: Record<string, true> = {}
    for (const [key, selected] of Object.entries(firstFields)) {
      if (selected) fields[key] = true
    }
    for (const [key, selected] of Object.entries(secondFields)) {
      if (selected) fields[key] = true
    }
    callbackSelections.set(fn, fields)
    if (!callbackReadsItemField(first) && !callbackReadsItemField(second)) {
      callbacksWithoutItem.add(fn)
    }
  }
  return fn
}

export function getCallbackSelection(callback: Function | undefined) {
  return callback === undefined ? 'all' : (callbackSelections.get(callback) ?? 'all')
}
