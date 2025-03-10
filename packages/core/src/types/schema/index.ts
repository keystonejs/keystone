import type { BaseKeystoneTypeInfo } from '../type-info'
import type { initG } from './graphql-ts-schema'

export * as g from './graphql-ts-schema'
export type g<
  K extends initG.Key,
  FirstArg extends initG.Arg[K],
  SecondArg extends initG.OtherArg[K] = initG.OtherArgDefaults<FirstArg>[K],
> = initG<BaseKeystoneTypeInfo, K, FirstArg, SecondArg>
export * from './legacy-alias'
