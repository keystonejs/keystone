import type { GWithContext } from '@graphql-ts/schema'
import { gWithContext as baseGWithContext } from '@graphql-ts/schema'
import { extend } from '@graphql-ts/extend'
import * as scalars from './scalars.ts'
import type { KeystoneContext } from '../context.ts'
import { fieldTypeOutput, itemField } from '../item-field.ts'

export function gWithContext<Context extends KeystoneContext<any>>(): GWithContext<Context> &
  typeof scalars & {
    extend: typeof extend
    itemField: ReturnType<typeof itemField<Context>>
    fieldTypeOutput: ReturnType<typeof fieldTypeOutput<Context>>
  } {
  return {
    ...baseGWithContext<Context>(),
    ...scalars,
    extend,
    itemField: itemField<Context>(),
    fieldTypeOutput: fieldTypeOutput<Context>(),
  }
}

export declare namespace gWithContext {
  export type infer<T> = baseGWithContext.infer<T>
}
