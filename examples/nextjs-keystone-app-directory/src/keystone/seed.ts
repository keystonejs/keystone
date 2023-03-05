import type { Context } from '.keystone/types';

const demoUsers = [
  {
    email: 'clark@email.com',
    password: 'passw0rd',
    name: 'Clark Kent',
  },
  {
    email: 'bruce@email.com',
    password: 'passw0rd',
    name: 'Bruce Wayne',
  },
  {
    email: 'diana@email.com',
    password: 'passw0rd',
    name: 'Diana Prince',
  },
] as const;

const upsertUser = async ({
  context,
  user,
}: {
  context: Context;
  user: { email: string; password: string; name: string };
}) => {
  const userInDb = await context.db.User.findOne({
    where: { email: user.email },
  });
  if (userInDb) {
    return userInDb;
  }

  return context.db.User.createOne({ data: user });
};

export const seedDemoData = (context: Context) => {
  const sudoContext = context.sudo();
  return Promise.all(demoUsers.map(u => upsertUser({ context: sudoContext, user: u })));
};
