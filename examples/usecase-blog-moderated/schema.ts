import { list } from '@keystone-6/core';
import { allowAll, denyAll, unfiltered } from '@keystone-6/core/access';
import { checkbox, text, relationship, timestamp } from '@keystone-6/core/fields';
import type { Lists } from '.keystone/types';

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

export type Session = {
  id: string;
  admin: boolean;
  contributor: null | { id: string };
  moderator: null | { id: string };
};

function forUsers<T>({
  admin,
  moderator,
  contributor,
  default: _default,
}: {
  admin?: ({ session }: { session: Session }) => T;
  moderator?: ({ session }: { session: Session }) => T;
  contributor?: ({ session }: { session: Session }) => T;
  default: () => T;
}) {
  return ({ session }: { session?: Session }): T => {
    if (!session) return _default();
    if (admin && session.admin) return admin({ session });
    if (moderator && session.moderator) return moderator({ session });
    if (contributor && session.contributor) return contributor({ session });
    return _default();
  };
}

const adminOnly = forUsers({
  admin: allowAll,
  default: denyAll,
});

const moderatorsOnly = forUsers({
  admin: allowAll,
  moderator: allowAll,
  default: denyAll,
});

const contributorsOnly = forUsers({
  admin: allowAll,
  contributor: allowAll,
  default: denyAll,
});

function readOnlyBy(f: ({ session }: { session?: Session }) => boolean) {
  return {
    read: f,
    create: denyAll,
    update: denyAll,
  };
}

function viewOnlyBy(f: ({ session }: { session?: Session }) => boolean, mode: 'edit' | 'read') {
  return {
    createView: {
      fieldMode: ({ session }: { session?: Session }) =>
        f({ session }) ? (mode === 'edit' ? 'edit' : 'hidden') : 'hidden',
    },
    itemView: {
      fieldMode: ({ session }: { session?: Session }) => (f({ session }) ? mode : 'hidden'),
    },
    listView: {
      fieldMode: ({ session }: { session?: Session }) => (f({ session }) ? 'read' : 'hidden'),
    },
  };
}

export const lists: Lists = {
  Post: list({
    access: {
      operation: {
        query: allowAll, // WARNING: public
        create: contributorsOnly,
        update: forUsers({
          admin: allowAll,
          moderator: allowAll,
          contributor: allowAll,
          default: denyAll,
        }),
        delete: adminOnly,
      },
      filter: {
        query: forUsers({
          admin: unfiltered,
          moderator: unfiltered,
          default: () => ({
            hiddenBy: null,
          }),
        }),
        update: forUsers({
          contributor: ({ session }) => ({
            createdBy: { id: { equals: session.contributor?.id } },
            hiddenBy: null,
          }),
          default: unfiltered,
        }),
      },
    },
    fields: {
      title: text(),
      content: text(),
      hidden: checkbox({
        access: moderatorsOnly,
        ui: {
          ...viewOnlyBy(moderatorsOnly, 'edit'),
        },
      }),

      // read only
      createdBy: relationship({
        ref: 'Contributor.posts',
        access: readOnlyBy(allowAll),
        ui: {
          ...viewOnlyBy(allowAll, 'read'),
        },
      }),
      createdAt: timestamp({
        access: readOnlyBy(allowAll),
        defaultValue: { kind: 'now' },
        ui: {
          ...viewOnlyBy(allowAll, 'read'),
        },
      }),
      updatedAt: timestamp({
        access: readOnlyBy(allowAll),
        defaultValue: { kind: 'now' },
        ui: {
          ...viewOnlyBy(allowAll, 'read'),
        },
      }),
      hiddenBy: relationship({
        ref: 'Moderator.hidden',
        access: readOnlyBy(moderatorsOnly),
        ui: {
          ...viewOnlyBy(moderatorsOnly, 'read'),
        },
      }),
      hiddenAt: timestamp({
        access: readOnlyBy(moderatorsOnly),
        ui: {
          ...viewOnlyBy(moderatorsOnly, 'read'),
        },
        hooks: {
          resolveInput: ({ resolvedData, fieldKey }) => {
            return resolvedData[fieldKey];
          },
        },
      }),
    },
    hooks: {
      resolveInput: {
        create: ({ context, resolvedData }) => {
          if (context.session?.contributor) {
            return {
              ...resolvedData,
              createdBy: {
                connect: {
                  id: (context.session as Session)?.contributor?.id,
                },
              },
            };
          }
          return resolvedData;
        },
        update: ({ context, resolvedData }) => {
          resolvedData.updatedAt = new Date();
          if ('hidden' in resolvedData && context.session?.moderator) {
            resolvedData.hiddenBy = resolvedData.hidden
              ? {
                  connect: {
                    id: (context.session as Session)?.moderator?.id,
                  },
                  // TODO: should support : null
                }
              : {
                  disconnect: true,
                };

            resolvedData.hiddenAt = resolvedData.hidden ? new Date() : null;
          }

          return resolvedData;
        },
      },
    },
  }),

  Contributor: list({
    access: {
      operation: {
        query: allowAll, // WARNING: public
        create: adminOnly,
        update: contributorsOnly,
        delete: adminOnly,
      },
      filter: {
        update: forUsers({
          contributor: ({ session }) => ({ id: { equals: session.contributor?.id } }),
          default: unfiltered,
        }),
      },
    },
    fields: {
      bio: text(),
      posts: relationship({ ref: 'Post.createdBy', many: true }),
    },
  }),

  Moderator: list({
    access: {
      operation: {
        query: moderatorsOnly,
        create: adminOnly,
        update: moderatorsOnly,
        delete: adminOnly,
      },
      filter: {
        update: forUsers({
          moderator: ({ session }) => ({ id: { equals: session.moderator?.id } }),
          default: unfiltered,
        }),
      },
    },
    fields: {
      hidden: relationship({ ref: 'Post.hiddenBy', many: true }),
    },
  }),

  User: list({
    access: adminOnly,
    fields: {
      name: text(),
      admin: checkbox(),
      contributor: relationship({ ref: 'Contributor' }),
      moderator: relationship({ ref: 'Moderator' }),
    },
  }),
};
