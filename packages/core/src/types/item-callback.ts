import { addSelection, type FieldSelection, type SelectedItem } from './item-selection.ts'

type ItemFromArgs<Args> = Args extends { item: unknown } | { originalItem: unknown }
  ?
      | NonNullable<Args extends { item: infer Item } ? Item : never>
      | NonNullable<Args extends { originalItem: infer Item } ? Item : never>
  : Args extends { results: infer Results }
    ? Results extends readonly (infer Item)[]
      ? Item
      : never
    : unknown

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
  : Args

/** Type-only marker for an item that also has the columns selected by the callbacks passed to `selectItem.wrap`. */
export declare const wrappedSelection: unique symbol
export type WrappedSelection = { readonly [wrappedSelection]: true }

type WithWrappedSelection<Item> = Item extends object ? Item & WrappedSelection : Item

type WrappedArgs<Args> = {
  [Key in keyof Args]: Key extends 'item' | 'originalItem'
    ? WithWrappedSelection<Args[Key]>
    : Key extends 'results'
      ? Args[Key] extends (infer Item)[]
        ? WithWrappedSelection<Item>[]
        : Args[Key]
      : Args[Key]
}

type WrappedCallback<Fn, Arg, Selection> = Fn extends (arg: any) => infer Result
  ? (arg: WrappedArgs<SelectedArgs<Arg, Selection>>) => Result
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
  ) => (arg: WrappedArgs<SelectedArgs<Arg, Selection>>) => Result,
  select: Selection & FieldSelection<ItemFromArgs<Arg>>,
  ...fns: Fns & ReadonlyArray<((arg: Arg) => any) | undefined>
): (arg: Arg) => Result {
  const wrapped = wrapper(...(fns as any)) as unknown as (arg: Arg) => Result
  const combined: Record<string, true> = {}
  for (const fn of fns) {
    if (!fn) continue
    const inherited = getCallbackSelection(fn)
    if (inherited === 'all') return wrapped
    addSelection(combined, inherited)
  }
  addSelection(combined, select)
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
    addSelection(fields, firstFields)
    addSelection(fields, secondFields)
    callbackSelections.set(fn, fields)
    if (!callbackReadsItemField(first) && !callbackReadsItemField(second)) {
      callbacksWithoutItem.add(fn)
    }
  }
  return fn
}

export function getCallbackSelection(callback: Function) {
  return callbackSelections.get(callback) ?? 'all'
}
