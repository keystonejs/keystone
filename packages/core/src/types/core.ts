import type { GraphQLResolveInfo } from 'graphql'
import type { KeystoneContext } from './context'

export type DatabaseProvider = 'sqlite' | 'postgresql' | 'mysql'

export type GraphQLResolver<Context extends KeystoneContext> = (
  root: any,
  args: any,
  context: Context,
  info: GraphQLResolveInfo
) => any

export type GraphQLSchemaExtension<Context extends KeystoneContext> = {
  typeDefs: string
  resolvers: Record<string, Record<string, GraphQLResolver<Context>>>
}
