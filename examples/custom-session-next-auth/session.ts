import { getContext } from '@keystone-6/core/context';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './admin/pages/api/auth/[...nextauth]';
import config from './keystone';
import * as PrismaModule from '.myprisma/client';
import type { Context } from '.keystone/types';

export type Session = {
  id: string;
};
const sudoContext: Context =
  (globalThis as any).keystoneContext || getContext(config, PrismaModule).sudo();

if (process.env.NODE_ENV !== 'production') (globalThis as any).sudoContext = sudoContext;

export async function onNextSignIn({ user, account, profile }: any) {
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
}

export async function getNextSession({ session, token }: any) {
  // console.log('Next Auth Session Details', { session, token });
  // add the users subjectId and email to the session object
  return { ...session, email: token.email, subjectId: token.sub };
}

export const nextAuthSession = {
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
    const nextAuthSession = await getServerSession({ headers, cookies } as any, res, authOptions);
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
