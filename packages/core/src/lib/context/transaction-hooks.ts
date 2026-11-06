import { Decimal } from 'decimal.js'
import type { KeystoneContext } from '../../types/index.ts'
import { extensionError } from '../core/graphql-errors.ts'
import { runSideEffectOnlyHook } from '../core/hooks.ts'
import type { InitialisedList } from '../core/initialise-lists.ts'

type OperationArgs = Parameters<
  InitialisedList['hooks']['afterOperation']['create' | 'update' | 'delete']
>[0]

// Context derivation must share the queue, but callback contexts must not retain the tx client.
const transactionContexts = new WeakMap<
  KeystoneContext,
  { lifecycle: TransactionLifecycle; getCallbackContext: () => KeystoneContext }
>()

export function bindTransactionContext(
  context: KeystoneContext,
  lifecycle: TransactionLifecycle,
  getCallbackContext: () => KeystoneContext
) {
  transactionContexts.set(context, { lifecycle, getCallbackContext })
}

/**
 * Copy operation data without flattening Prisma's Date, Decimal, BigInt or Bytes values.
 * Plain objects/arrays and native value containers are copied, including cycles. Opaque
 * custom scalar instances, functions and upload promises/streams retain their identity;
 * they are not replayable database values and must not be mutated after registration.
 */
export function snapshotTransactionValue<T>(value: T, seen = new Map<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value
  if (seen.has(value)) return seen.get(value) as T

  if (Decimal.isDecimal(value)) return new Decimal(value) as T
  if (value instanceof Date) return new Date(value.getTime()) as T
  if (Buffer.isBuffer(value)) return Buffer.from(value) as T
  if (value instanceof Uint8Array) return value.slice() as T
  if (value instanceof ArrayBuffer) return value.slice(0) as T
  if (ArrayBuffer.isView(value)) return structuredClone(value)
  if (value instanceof RegExp) {
    const copy = new RegExp(value.source, value.flags)
    copy.lastIndex = value.lastIndex
    return copy as T
  }
  if (value instanceof Map) {
    const copy = new Map()
    seen.set(value, copy)
    for (const [key, entry] of value) {
      copy.set(snapshotTransactionValue(key, seen), snapshotTransactionValue(entry, seen))
    }
    return copy as T
  }
  if (value instanceof Set) {
    const copy = new Set()
    seen.set(value, copy)
    for (const entry of value) copy.add(snapshotTransactionValue(entry, seen))
    return copy as T
  }

  const prototype = Object.getPrototypeOf(value)
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) return value

  let copy
  if (Array.isArray(value)) {
    copy = new Array(value.length)
  } else {
    copy = Object.create(prototype)
  }
  seen.set(value, copy)
  for (const [key, entry] of Object.entries(value)) {
    Object.defineProperty(copy, key, {
      value: snapshotTransactionValue(entry, seen),
      enumerable: true,
      configurable: true,
      writable: true,
    })
  }
  return copy
}

export class TransactionLifecycle {
  #settled = false
  #operations: { list: InitialisedList; args: OperationArgs }[] = []

  register(list: InitialisedList, args: OperationArgs) {
    if (this.#settled) {
      throw new Error(
        'Cannot register transaction hooks after settlement; await all transaction operations'
      )
    }
    this.#operations.push({ list, args })
  }

  async settle(hookName: 'afterCommit' | 'afterRollback', error?: unknown) {
    this.#settled = true
    const operations = this.#operations
    this.#operations = []
    const errors: { error: Error; tag: string }[] = []

    // Registration order is write-completion order, not the start order of concurrent mutations.
    for (const { list, args } of operations) {
      try {
        if (hookName === 'afterCommit') {
          await runSideEffectOnlyHook(list, 'transaction.afterCommit', args)
        } else {
          await runSideEffectOnlyHook(list, 'transaction.afterRollback', { ...args, error })
        }
      } catch (error) {
        errors.push({
          error: error instanceof Error ? error : new Error(String(error)),
          tag: `${list.listKey}.hooks.transaction.${hookName}`,
        })
      }
    }

    if (errors.length) throw extensionError(`transaction.${hookName}`, errors)
  }
}

/** Register immediately after a successful write, before any afterOperation hook can fail. */
export function registerTransactionHooks(list: InitialisedList, args: OperationArgs) {
  const binding = transactionContexts.get(args.context)
  if (!binding) return // Ordinary mutations do not acquire an implicit transaction lifecycle.

  if (!list.hooks.transaction && !Object.values(list.fields).some(field => field.hooks.transaction))
    return

  const { context, ...data } = args
  binding.lifecycle.register(list, {
    ...snapshotTransactionValue(data),
    context: binding.getCallbackContext(),
  })
}
