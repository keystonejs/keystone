import type { MaybePromise } from './types/utils.ts'
import type { BaseListTypeInfo } from './types/index.ts'
import { callbackWithoutItem } from './types/item-callback.ts'

export function allowAll() {
  return true
}

export function denyAll() {
  return false
}

export function unfiltered<ListTypeInfo extends BaseListTypeInfo>(): MaybePromise<
  boolean | ListTypeInfo['inputs']['where']
> {
  return true
}

callbackWithoutItem(allowAll)
callbackWithoutItem(denyAll)
callbackWithoutItem(unfiltered)

export function allOperations<F>(f: F) {
  return {
    query: f,
    create: f,
    update: f,
    delete: f,
  }
}
