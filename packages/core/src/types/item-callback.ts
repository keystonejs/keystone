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

type WithMarker<Item, Marker> = Item extends object ? Item & Marker : Item

type SelectedArgs<Args, Selection, Marker = unknown> = Args extends
  | { item: unknown }
  | { originalItem: unknown }
  | { results: unknown }
  ? {
      [Key in keyof Args]: Key extends 'item' | 'originalItem'
        ? WithMarker<SelectedItem<Args[Key], Selection>, Marker>
        : Key extends 'results'
          ? Args[Key] extends (infer Item)[]
            ? WithMarker<SelectedItem<Item, Selection>, Marker>[]
            : Args[Key]
          : Args[Key]
    }
  : WithMarker<SelectedItem<Args, Selection>, Marker>

/** Type-only marker for an item that also has the columns selected by the callbacks passed to `selectItem.wrap`. */
export declare const wrappedSelection: unique symbol
export type WrappedSelection = { readonly [wrappedSelection]: true }

type WrappedCallback<Fn, Arg, Selection> = Fn extends (arg: any) => infer Result
  ? (arg: SelectedArgs<Arg, Selection, WrappedSelection>) => Result
  : Fn

const callbackSelections = new WeakMap<Function, Readonly<Record<string, true | undefined>>>()
const callbacksWithoutItem = new WeakSet<Function>()

/** Declare the item columns read by a callback. `id` is always available. */
export function selectItem<Arg, Result, const Selection extends FieldSelection<ItemFromArgs<Arg>>>(
  fn: (arg: SelectedArgs<Arg, Selection>) => Result,
  select: Selection & FieldSelection<ItemFromArgs<Arg>>
): (arg: Arg) => Result {
  const wrapped = (arg: Arg): Result => fn(arg as SelectedArgs<Arg, Selection>)
  callbackSelections.set(wrapped, select)
  return wrapped
}
/**
 * Wrap callbacks while selecting the columns read by the wrapper and its source callbacks.
 * The wrapper can only read its own selected columns but can pass its arguments to the source callbacks.
 */
selectItem.wrap = function wrap<
  Fns extends ReadonlyArray<((arg: Arg) => any) | undefined>,
  Arg,
  Result,
  const Selection extends FieldSelection<ItemFromArgs<Arg>>,
>(
  wrapper: (
    ...fns: { [Key in keyof Fns]: WrappedCallback<Fns[Key], Arg, Selection> }
  ) => (arg: SelectedArgs<Arg, Selection, WrappedSelection>) => Result,
  select: Selection & FieldSelection<ItemFromArgs<Arg>>,
  ...fns: Fns & ReadonlyArray<((arg: Arg) => any) | undefined>
): (arg: Arg) => Result {
  const wrapped = wrapper(...(fns as any)) as unknown as (arg: Arg) => Result
  const combined: Record<string, true | undefined> = {}
  for (const fn of fns) {
    if (!fn) continue
    const inherited = getCallbackSelection(fn)
    if (inherited === 'all') return wrapped
    for (const [key, selected] of Object.entries(inherited)) {
      if (selected) combined[key] = true
    }
  }
  for (const [key, selected] of Object.entries(select)) {
    if (selected) combined[key] = true
  }
  callbackSelections.set(wrapped, combined)
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
