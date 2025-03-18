import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { getContext } from '@keystone-6/core/context'
import keystone from '../../../keystone'
import * as PrismaModule from 'myprisma'

const context = getContext(keystone, PrismaModule)

const server = new ApolloServer({
  schema: context.graphql.schema,
})

const handler = startServerAndCreateNextHandler(server, { context: async () => context })

export { handler as GET, handler as POST }
