import { getContext } from '@keystone-6/core/context';
import { getServerSession } from 'next-auth/next';
import type { DefaultJWT } from 'next-auth/jwt';
import type { DefaultUser } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import type { Context } from '.keystone/types';

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

// WARNING: you need to change this
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';

let _keystoneContext: Context = (globalThis as any)._keystoneContext;

async function getKeystoneContext() {
  if (_keystoneContext) return _keystoneContext;

  // TODO: this could probably be better
  _keystoneContext = getContext(
    (await import('./keystone')).default,
    // We use the prisma client from the .myprisma folder in order to support multiple Prisma Clients in our examples
    // your project will only have one Prisma Client, so you can use the following instead:
    // await import('@primsa/client')
    await import('.myprisma/client')
  );
  if (process.env.NODE_ENV !== 'production') {
    (globalThis as any)._keystoneContext = _keystoneContext;
  }
  return _keystoneContext;
}

// see https://next-auth.js.org/configuration/options for more
export const nextAuthOptions = {
  secret: sessionSecret,
  callbacks: {
    async signIn({ user }: { user: DefaultUser }) {
      // console.error('next-auth signIn', { user, account, profile });
      const sudoContext = (await getKeystoneContext()).sudo();

      // check if the user exists in keystone
      const author = await sudoContext.query.Author.findOne({
        where: { authId: user.id },
      });

      // if not, sign up
      if (!author) {
        await sudoContext.query.Author.createOne({
          data: {
            authId: user.id,
            name: user.name,
          },
        });
      }

      return true; // accept the signin
    },

    async session({
      token: {
        sub: authId, // may be missing
      },
    }: {
      token: DefaultJWT;
    }) {
      // console.error('next-auth session', { session, token });
      if (!authId) return;
      return { authId };
    },
  },
  providers: [
    // allow anyone with a GitHub account to sign up as an author
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
};

export type Session = {
  id: string;
};

export const nextAuthSessionStrategy = {
  async get({ context }: { context: Context }) {
    const { req, res } = context;
    const { headers } = req ?? {};
    if (!headers?.cookie || !res) return;

    // next-auth needs a different cookies structure
    const cookies: Record<string, string> = {};
    for (const part of headers.cookie.split(';')) {
      const [key, value] = part.trim().split('=');
      cookies[key] = decodeURIComponent(value);
    }

    const nextAuthSession = await getServerSession(
      { headers, cookies } as any,
      res,
      nextAuthOptions
    );
    if (!nextAuthSession) return;

    const author = await context.sudo().db.Author.findOne({
      where: { authId: nextAuthSession.authId },
    });
    if (!author) return;

    return { id: author.id };
  },

  // we don't need these as next-auth handle start and end for us
  async start() {},
  async end() {},
};
