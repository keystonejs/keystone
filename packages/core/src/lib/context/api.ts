import type { GraphQLSchema } from 'graphql'
import type { KeystoneContext } from '../../types'
import type { InitialisedList } from '../core/initialise-lists'
import { makeContextDbFn, makeContextQueryFn } from './graphql'

export function getQueryFactory(list: InitialisedList, schema: GraphQLSchema) {
  const queryType = schema.getQueryType()!
  const mutationType = schema.getMutationType()!

  function f(operation: 'query' | 'mutation', fieldName: string) {
    const rootType = operation === 'query' ? queryType : mutationType
    const field = rootType.getFields()[fieldName]
    if (field) return makeContextQueryFn(schema, operation, field)

    // if omitted
    return () => {
      throw new Error(`This ${operation} is not supported by the GraphQL schema: ${fieldName}()`)
    }
  }

  const { listQueryCountName, whereInputName } = list.graphql.names
  const fcache = {
    findOne: f('query', list.graphql.names.itemQueryName),
    findMany: f('query', list.graphql.names.listQueryName),
    count: async (args: Record<string, any> = {}, context: KeystoneContext) => {
      const { where = {} } = args
      const { count } = (await context.graphql.run({
        query: `query ($where: ${whereInputName}!) { count: ${listQueryCountName}(where: $where) }`,
        variables: { where },
      })) as {
        count: number
      }

      return count
    },
    createOne: f('mutation', list.graphql.names.createMutationName),
    createMany: f('mutation', list.graphql.names.createManyMutationName),
    updateOne: f('mutation', list.graphql.names.updateMutationName),
    updateMany: f('mutation', list.graphql.names.updateManyMutationName),
    deleteOne: f('mutation', list.graphql.names.deleteMutationName),
    deleteMany: f('mutation', list.graphql.names.deleteManyMutationName),
  }

  return (context: KeystoneContext) => {
    return {
      findOne: (args: Record<string, any>) => fcache.findOne(args, context),
      findMany: (args: Record<string, any>) => fcache.findMany(args, context),
      count: (args: Record<string, any>) => fcache.count(args, context),
      createOne: (args: Record<string, any>) => fcache.createOne(args, context),
      createMany: (args: Record<string, any>) => fcache.createMany(args, context),
      updateOne: (args: Record<string, any>) => fcache.updateOne(args, context),
      updateMany: (args: Record<string, any>) => fcache.updateMany(args, context),
      deleteOne: (args: Record<string, any>) => fcache.deleteOne(args, context),
      deleteMany: (args: Record<string, any>) => fcache.deleteMany(args, context),
    }
  }
}

export function getDbFactory(list: InitialisedList, schema: GraphQLSchema) {
  const queryType = schema.getQueryType()!
  const mutationType = schema.getMutationType()!

  function f(operation: 'query' | 'mutation', fieldName: string) {
    const rootType = operation === 'query' ? queryType : mutationType
    const field = rootType.getFields()[fieldName]
    if (field) return makeContextDbFn(field)

    // if omitted
    return () => {
      throw new Error(`This ${operation} is not supported by the GraphQL schema: ${fieldName}()`)
    }
  }

  const fcache = {
    findOne: f('query', list.graphql.names.itemQueryName),
    findMany: f('query', list.graphql.names.listQueryName),
    count: f('query', list.graphql.names.listQueryCountName),
    createOne: f('mutation', list.graphql.names.createMutationName),
    createMany: f('mutation', list.graphql.names.createManyMutationName),
    updateOne: f('mutation', list.graphql.names.updateMutationName),
    updateMany: f('mutation', list.graphql.names.updateManyMutationName),
    deleteOne: f('mutation', list.graphql.names.deleteMutationName),
    deleteMany: f('mutation', list.graphql.names.deleteManyMutationName),
  }

  return (context: KeystoneContext) => {
    return {
      findOne: (args: Record<string, any>) => fcache.findOne(args, context),
      findMany: (args: Record<string, any>) => fcache.findMany(args, context),
      count: (args: Record<string, any>) => fcache.count(args, context),
      createOne: (args: Record<string, any>) => fcache.createOne(args, context),
      createMany: (args: Record<string, any>) => fcache.createMany(args, context),
      updateOne: (args: Record<string, any>) => fcache.updateOne(args, context),
      updateMany: (args: Record<string, any>) => fcache.updateMany(args, context),
      deleteOne: (args: Record<string, any>) => fcache.deleteOne(args, context),
      deleteMany: (args: Record<string, any>) => fcache.deleteMany(args, context),
    }
  }
}
