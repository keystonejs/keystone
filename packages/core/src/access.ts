import type { MaybePromise } from './types/utils'
import type { BaseListTypeInfo } from './types'

export function allowAll () {
  return true
}

export function denyAll () {
  return false
}

export function unfiltered<ListTypeInfo extends BaseListTypeInfo> (): MaybePromise<
  boolean | ListTypeInfo['inputs']['where']
> {
  return true
}

export function allOperations<F> (f: F) {
  return {
    query: f,
    create: f,
    update: f,
    delete: f,
  }
}
