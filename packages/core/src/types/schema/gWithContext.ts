import type { GWithContext } from '@graphql-ts/schema'
import { gWithContext as baseGWithContext } from '@graphql-ts/schema'
import { extend } from '@graphql-ts/extend'
import * as scalars from './scalars'
import type { KeystoneContext } from '../context'

export function gWithContext<Context extends KeystoneContext<any>>(): GWithContext<Context> &
  typeof scalars & {
    extend: typeof extend
  } {
  return {
    ...baseGWithContext<Context>(),
    ...scalars,
    extend,
  }
}

export declare namespace gWithContext {
  export type infer<T> = baseGWithContext.infer<T>
}
