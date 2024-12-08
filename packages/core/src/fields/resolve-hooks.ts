import {  type MaybePromise } from '../types'

export function merge <
  R,
  A extends (r: R) => MaybePromise<void>,
  B extends (r: R) => MaybePromise<void>
> (a?: A, b?: B) {
  if (!a && !b) return undefined
  return async (args: R) => {
    await a?.(args)
    await b?.(args)
  }
}
