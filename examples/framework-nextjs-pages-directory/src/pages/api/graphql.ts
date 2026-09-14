import { createYoga } from 'graphql-yoga'
import type { NextApiRequest, NextApiResponse } from 'next'
import { keystoneContext } from '../../keystone/context'

/*
  An example of how to setup your own yoga graphql server
  using the generated Keystone GraphQL schema.
*/
// Use Keystone API to create GraphQL handler
export default createYoga<{
  req: NextApiRequest
  res: NextApiResponse
}>({
  graphqlEndpoint: '/api/graphql',
  multipart: false,
  schema: keystoneContext.graphql.schema,
  /*
    `keystoneContext` object doesn't have user's session information.
    You need an authenticated context to CRUD data behind access control.
    keystoneContext.withHeaders(request.headers, responseHeaders) automatically unwraps the session cookie
    in the request object and gives you a `context` object with session info
    and an elevated sudo context to bypass access control if needed (context.sudo()).
  */
  context: ({ request }) => {
    const responseHeaders = new Headers()
    requestToResponseHeaders.set(request, responseHeaders)
    return keystoneContext.withHeaders(request.headers, responseHeaders)
  },
  plugins: [
    {
      onResponse({ response, request }) {
        const headers = requestToResponseHeaders.get(request)
        if (headers) {
          for (const [key, value] of headers.entries()) {
            if (key !== 'set-cookie') response.headers.set(key, value)
          }
          for (const value of headers.getSetCookie()) {
            response.headers.append('set-cookie', value)
          }
        }
      },
    },
  ],
  fetchAPI: globalThis,
})

const requestToResponseHeaders = new WeakMap<Request, Headers>()
