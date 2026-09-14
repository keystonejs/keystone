import { createYoga } from 'graphql-yoga'
import { keystoneContext } from '../../../keystone/context'

/*
  An example of how to setup your own Yoga GraphQL server
  using the generated Keystone GraphQL schema.
*/
const yoga = createYoga({
  graphqlEndpoint: '/api/graphql',
  multipart: false,
  schema: keystoneContext.graphql.schema,
})

function handler(request: Request) {
  return yoga.handleRequest(request, keystoneContext)
}

export { handler as GET, handler as POST }
