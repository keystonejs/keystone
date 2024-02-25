import { createYoga } from 'graphql-yoga'
import { keystoneContext } from '../../../keystone/context'

const { handleRequest } = createYoga({
  graphqlEndpoint: '/api/graphql',
  schema: keystoneContext.graphql.schema,
  context: async () => {
    // in real world call something like 'getServerSession' from next-auth to get session info
    return keystoneContext.withSession({})
  },

  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },
})

export { handleRequest as GET, handleRequest as POST }
