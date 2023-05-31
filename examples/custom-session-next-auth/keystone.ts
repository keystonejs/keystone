import { config } from '@keystone-6/core';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { fixPrismaPath } from '../example-utils';
import { lists } from './schema';
import { authOptions } from './admin/pages/api/auth/[...nextauth]';
import type { Context, TypeInfo } from '.keystone/types';

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

const nextAuthSession = {
  async get({ context }: { context: Context }): Promise<Session | undefined> {
    const { req, res } = context;
    const { headers } = req ?? {};
    if (!headers?.cookie || !res) return;

    // next-auth needs an different cookies structure
    const cookies: Record<string, string> = {};
    for (const part of headers.cookie.split(';')) {
      const [key, value] = part.trim().split('=');
      cookies[key] = decodeURIComponent(value);
    }

    return (await getServerSession({ headers, cookies } as any, res, authOptions)) ?? undefined;
  },

  // we don't need these as next-auth handle start and end for us
  async start() {},
  async end() {},
};

export default config<TypeInfo<Session>>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  ui: {
    // The following API routes are required for NextAuth.js
    publicPages: [
      '/api/auth/csrf',
      '/api/auth/signin',
      '/api/auth/callback',
      '/api/auth/session',
      '/api/auth/providers',
      '/api/auth/signout',
      '/api/auth/error',
      // Each provider will need a separate callback and signin page listed here
      '/api/auth/signin/github',
      '/api/auth/callback/github',
    ],
    // Adding Page middleware ensures that users are redirected to the signin page if they are not signed in.
    pageMiddleware: async ({ wasAccessAllowed }) => {
      if (wasAccessAllowed) return;
      return {
        kind: 'redirect',
        to: '/api/auth/signin',
      };
    },
  },
  lists,
  // you can find out more at https://keystonejs.com/docs/apis/session#session-api
  session: nextAuthSession,
});
