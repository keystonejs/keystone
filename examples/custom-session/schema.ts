import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { checkbox, text } from '@keystone-6/core/fields';
import type { Lists } from '.keystone/types';

export type Session = {
  id: string;
  admin: boolean;
};

function hasSession ({ session }: { session: Session | undefined }) {
  return Boolean(session);
}

function isAdmin ({ session }: { session: Session | undefined }) {
  if (!session) return false;
  return session.admin;
}

function isAdminOrOnlySameUser ({ session }: { session: Session | undefined }) {
  if (!session) return false;
  if (session.admin) return {}; // unfiltered for admins
  return {
    id: { equals: session.id }
  };
}

export const lists: Lists = {
  Post: list({
    access: {
      operation: {
        query: allowAll,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      }
    },
    fields: {
      title: text(),
      content: text(),
    },
  }),

  User: list({
    access: {
      operation: {
        query: hasSession,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      },
      filter: {
        query: isAdminOrOnlySameUser,
        update: isAdminOrOnlySameUser,
        delete: isAdminOrOnlySameUser
      }
    },
    fields: {
      name: text(),
      admin: checkbox()
    }
  })
};
