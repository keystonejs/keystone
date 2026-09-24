import type { GWithContext } from '@graphql-ts/schema'
import { gWithContext as baseGWithContext } from '@graphql-ts/schema'
import { extend } from '@graphql-ts/extend'
import * as scalars from './scalars.ts'
import type { KeystoneContext } from '../context.ts'
import { keystoneOutputField, listItemField } from '../item-field.ts'

export function gWithContext<Context extends KeystoneContext<any>>(): GWithContext<Context> &
  typeof scalars & {
    extend: typeof extend
    listItemField: ReturnType<typeof listItemField<Context>>
    keystoneOutputField: ReturnType<typeof keystoneOutputField<Context>>
  } {
  return {
    ...baseGWithContext<Context>(),
    ...scalars,
    extend,
    listItemField: listItemField<Context>(),
    keystoneOutputField: keystoneOutputField<Context>(),
  }
}

export declare namespace gWithContext {
  export type infer<T> = baseGWithContext.infer<T>
}
