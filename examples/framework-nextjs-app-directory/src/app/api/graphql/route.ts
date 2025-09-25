import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { keystoneContext } from '../../../keystone/context'
import { NextRequest } from 'next/server'

const server = new ApolloServer<typeof keystoneContext>({
  schema: keystoneContext.graphql.schema,
})

const _handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    const resHeaders = new Headers()
    requestsToResponseHeaders.set(req, resHeaders)
    const context = await keystoneContext.withRequest(
      { headers: req.headers },
      { headers: resHeaders }
    )
    return context
  },
})

const requestsToResponseHeaders = new WeakMap<Request, Headers>()

const handler = async (req: NextRequest) => {
  const res = await _handler(req)
  const headers = requestsToResponseHeaders.get(req)
  if (headers) {
    for (const [key, value] of headers.entries()) {
      if (key === 'set-cookie') {
        res.headers.append(key, value)
      } else {
        res.headers.set(key, value)
      }
    }
  }
  return res
}

export { handler as GET, handler as POST }
