import { createYoga } from 'graphql-yoga';
import type { NextApiRequest, NextApiResponse } from 'next';
import processRequest from 'graphql-upload/processRequest.js';
import { keystoneContext } from '../../keystone/context';

/*
  An example of how to setup your own yoga graphql server
  using the generated Keystone GraphQL schema.
*/
export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
};

// Use Keystone API to create GraphQL handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const contentType = req.headers['content-type'];
  if (contentType && contentType.startsWith('multipart/form-data')) {
    req.body = await processRequest(req, res);
  }
  return createYoga<{
    req: NextApiRequest;
    res: NextApiResponse;
  }>({
    graphqlEndpoint: '/api/graphql',
    schema: keystoneContext.graphql.schema,
    /*
      `keystoneContext` object doesn't have user's session information.
      You need an authenticated context to CRUD data behind access control.
      keystoneContext.withRequest(req, res) automatically unwraps the session cookie
      in the request object and gives you a `context` object with session info
      and an elevated sudo context to bypass access control if needed (context.sudo()).
    */
    context: ({ req, res }) => keystoneContext.withRequest(req, res),
    /*
      For some reason graphql-yoga upload implementation does not work with keystone
      out-of-the-box. Need to process request manually with graphql-upload
    */
    multipart: false,
  })(req, res);
}
