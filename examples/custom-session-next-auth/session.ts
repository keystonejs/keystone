import { getContext } from '@keystone-6/core/context';
import { getServerSession } from 'next-auth/next';
import GithubProvider from 'next-auth/providers/github';
import config from './keystone';
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
  _keystoneContext = getContext(config, await import('.myprisma/client'));
  if (process.env.NODE_ENV !== 'production') {
    (globalThis as any)._keystoneContext = _keystoneContext;
  }
  return _keystoneContext;
}

// see https://next-auth.js.org/configuration/options for more
export const nextAuthOptions = {
  secret: sessionSecret,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      const sudoContext = (await getKeystoneContext()).sudo();
      // console.log('Next Auth Sign In Details', { user, account, profile });
      // check if the user exists in keystone
      const keystoneUser = await sudoContext.query.Author.findOne({
        where: { subjectId: profile.id },
      });
      // if not, create them
      if (!keystoneUser) {
        await sudoContext.query.Author.createOne({
          data: {
            subjectId: profile.id,
            name: profile.name,
          },
        });
      }
      // return true to allow the sign in to complete
      return true;
    },
    async session({ token, session }: any) {
      // console.log('Next Auth Session Details', { session, token });
      // add the users subjectId and email to the session object
      return { ...session, subjectId: token.sub };
    },
  },
  providers: [
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
  async get({ context }: { context: Context }): Promise<Session | undefined> {
    const { req, res } = context;
    const { headers } = req ?? {};
    if (!headers?.cookie || !res) return;

    // next-auth needs a different cookies structure
    const cookies: Record<string, string> = {};
    for (const part of headers.cookie.split(';')) {
      const [key, value] = part.trim().split('=');
      cookies[key] = decodeURIComponent(value);
    }
    // get the next-auth session
    // TODO: get types for getServerSession.
    const nextAuthSession = await getServerSession(
      { headers, cookies } as any,
      res,
      nextAuthOptions
    );
    // get the keystone user using the subjectId
    const keystoneAuthor = await context.db.Author.findOne({
      where: { subjectId: nextAuthSession?.subjectId },
    });
    if (!keystoneAuthor) return;
    return { id: keystoneAuthor.id };
  },

  // we don't need these as next-auth handle start and end for us
  async start() {},
  async end() {},
};
