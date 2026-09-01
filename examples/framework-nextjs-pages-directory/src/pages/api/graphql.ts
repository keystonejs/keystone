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
  context: ({ request, res }) => {
    const responseHeaders = new Headers()
    requestToResponse.set(request, { headers: responseHeaders, res })
    return keystoneContext.withHeaders(request.headers, responseHeaders)
  },
  plugins: [
    {
      onResponse({ response, request }) {
        const target = requestToResponse.get(request)
        if (!target) return
        const { headers, res } = target
        for (const [key, value] of headers.entries()) {
          if (key !== 'set-cookie') response.headers.set(key, value)
        }
        // graphql-yoga's Node adapter can't write a header more than once,
        // so set cookies on the Next.js response directly to keep each Set-Cookie value
        const cookies = headers.getSetCookie()
        if (cookies.length) res.setHeader('set-cookie', cookies)
      },
    },
  ],
  fetchAPI: globalThis,
})

const requestToResponse = new WeakMap<Request, { headers: Headers; res: NextApiResponse }>()
