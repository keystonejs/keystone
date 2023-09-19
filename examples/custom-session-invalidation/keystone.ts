import { config } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/auth/session';
import { createAuth } from '@keystone-6/auth';
import { fixPrismaPath } from '../example-utils';
import { lists, Session } from './schema';
import type { Context, TypeInfo } from '.keystone/types';

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

function withSessionInvalidation() {
  const sessionStrategy = statelessSessions<Session>({});
  return {
    ...sessionStrategy,
    async get({ context }: { context: Context }): Promise<Session | undefined> {
      const session = await sessionStrategy.get({ context });
      if (!session) return;

      // has the password changed since the session started?
      if (new Date(session.data.passwordChangedAt) > new Date(session.startedAt)) {
        // invalidate the session if password changed
        await sessionStrategy.end({ context });
        return;
      }

      return session;
    },
    async start({ context, data }: { context: Context; data: Session }) {
      return await sessionStrategy.start({
        context,
        data: {
          ...data,
          startedAt: Date.now(),
        },
      });
    },
  };
}

const { withAuth } = createAuth({
  // this is the list that contains our users
  listKey: 'User',

  // an identity field, typically a username or an email address
  identityField: 'name',

  // a secret field must be a password field type
  secretField: 'password',

  // initFirstItem enables the "First User" experience, this will add an interface form
  //   adding a new User item if the database is empty
  //
  // WARNING: do not use initFirstItem in production
  //   see https://keystonejs.com/docs/config/auth#init-first-item for more
  initFirstItem: {
    // the following fields are used by the "Create First User" form
    fields: ['name', 'password'],
  },
  sessionStrategy: withSessionInvalidation(),
});

export default withAuth(
  config<TypeInfo>({
    db: {
      provider: 'sqlite',
      url: process.env.DATABASE_URL || 'file:./keystone-example.db',

      // WARNING: this is only needed for our monorepo examples, dont do this
      ...fixPrismaPath,
    },
    lists,
    // you can find out more at https://keystonejs.com/docs/apis/session#session-api
  })
);
