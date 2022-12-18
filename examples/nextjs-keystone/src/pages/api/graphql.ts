import { createYoga } from 'graphql-yoga';
import type { NextApiRequest, NextApiResponse } from 'next';
// @ts-ignore
import processRequest from 'graphql-upload/processRequest';
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
  /*
    Keystone's GraphQL schema contains 'Upload' scalar which is based on
    graphql-upload's GraphQLUpload type. It is incompatible with yoga's
    built-in multipart processing. To make this work, multipart requests
    need to be pre-processed by graphql-upload before passing them to yoga.
    See more at https://github.com/keystonejs/keystone/issues/8176

    NOTE: If you are not planning to use Keystone's file upload capabilities
    (image, file or cloudinary_image fields), you can skip below processRequest().
  */
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
    // Disable graphql-yoga's built-in multipart processing.
    multipart: false,
  })(req, res);
}
