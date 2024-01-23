import { list } from '@keystone-6/core'
import { allowAll, denyAll, unfiltered } from '@keystone-6/core/access'
import { checkbox, text, relationship, timestamp } from '@keystone-6/core/fields'
import type { Lists } from '.keystone/types'

// WARNING: this example is for demonstration purposes only
//   as with each of our examples, it has not been vetted
//   or tested for any particular usage

export type Session = {
  id: string
  admin: boolean
  moderator: null | { id: string }
  contributor: null | { id: string }
}

type Has<T, K extends keyof T> = {
  [key in keyof T]: key extends K ? Exclude<T[key], null | undefined> : T[key];
}

function isAdmin<T extends Session> (session?: T): session is T & { admin: true } {
  return session?.admin === true
}
function isModerator<T extends Session> (session?: T): session is Has<T, 'moderator'> {
  return session?.moderator !== null
}
function isContributor<T extends Session> (session?: T): session is Has<T, 'contributor'> {
  return session?.contributor !== null
}

function forUsers<T> ({
  admin,
  moderator,
  contributor,
  default: _default,
}: {
  admin?: ({ session }: { session: Session & { admin: true } }) => T
  moderator?: ({ session }: { session: Has<Session, 'moderator'> }) => T
  contributor?: ({ session }: { session: Has<Session, 'contributor'> }) => T
  default: () => T
}) {
  return ({ session }: { session?: Session }): T => {
    if (!session) return _default()
    if (admin && isAdmin(session)) return admin({ session })
    if (moderator && isModerator(session)) return moderator({ session })
    if (contributor && isContributor(session)) return contributor({ session })
    return _default()
  }
}

const adminOnly = forUsers({
  admin: allowAll,
  default: denyAll,
})

const moderatorsOrAbove = forUsers({
  admin: allowAll,
  moderator: allowAll,
  default: denyAll,
})

const contributorsOrAbove = forUsers({
  admin: allowAll,
  moderator: allowAll,
  contributor: allowAll,
  default: denyAll,
})

function readOnlyBy (f: ({ session }: { session?: Session }) => boolean) {
  return {
    read: f,
    create: denyAll,
    update: denyAll,
  }
}

function viewOnlyBy (f: ({ session }: { session?: Session }) => boolean, mode: 'edit' | 'read') {
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
  }
}

function readOnlyViewBy (f: ({ session }: { session?: Session }) => boolean) {
  return viewOnlyBy(f, 'read')
}

function editOnlyViewBy (f: ({ session }: { session?: Session }) => boolean) {
  return viewOnlyBy(f, 'edit')
}

export const lists = {
  Post: list({
    access: {
      operation: {
        query: allowAll, // WARNING: public
        create: forUsers({
          admin: allowAll,
          contributor: allowAll,
          default: denyAll,
        }),
        update: contributorsOrAbove,
        delete: adminOnly,
      },
      filter: {
        // the 'default' allowed query is non-hidden posts
        //   but admins and moderators can see everything
        query: forUsers({
          admin: unfiltered,
          moderator: unfiltered,
          default: () => ({
            hiddenBy: null,
          }),
        }),
        update: forUsers({
          // contributors can only update their own posts
          contributor: ({ session }) => ({
            createdBy: { id: { equals: session.contributor.id } },
            hiddenBy: null,
          }),
          // otherwise, no filter
          default: unfiltered,
        }),
      },
    },
    fields: {
      title: text(),
      content: text(),
      hidden: checkbox({
        access: moderatorsOrAbove,
        ui: {
          ...editOnlyViewBy(moderatorsOrAbove),
        },
      }),

      // read only fields
      createdBy: relationship({
        ref: 'Contributor.posts',
        access: readOnlyBy(allowAll),
        ui: {
          ...readOnlyViewBy(allowAll),
        },
      }),
      createdAt: timestamp({
        access: readOnlyBy(allowAll),
        ui: {
          ...readOnlyViewBy(allowAll),
        },
      }),
      updatedAt: timestamp({
        access: readOnlyBy(allowAll),
        ui: {
          ...readOnlyViewBy(allowAll),
        },
      }),
      hiddenBy: relationship({
        ref: 'Moderator.hidden',
        access: readOnlyBy(moderatorsOrAbove),
        ui: {
          ...readOnlyViewBy(moderatorsOrAbove),
        },
      }),
      hiddenAt: timestamp({
        access: readOnlyBy(moderatorsOrAbove),
        ui: {
          ...readOnlyViewBy(moderatorsOrAbove),
        },
      }),
    },
    hooks: {
      resolveInput: {
        create: ({ context: { session }, resolvedData }) => {
          resolvedData.createdAt = new Date()
          if (isContributor(session)) {
            return {
              ...resolvedData,
              createdBy: {
                connect: {
                  id: session.contributor.id,
                },
              },
            }
          }
          return resolvedData
        },
        update: ({ context: { session }, resolvedData }) => {
          resolvedData.updatedAt = new Date()
          if ('hidden' in resolvedData && isModerator(session)) {
            resolvedData.hiddenBy = resolvedData.hidden
              ? {
                  connect: {
                    id: session.moderator.id,
                  },
                  // TODO: should support : null
                }
              : {
                  disconnect: true,
                }

            resolvedData.hiddenAt = resolvedData.hidden ? new Date() : null
          }

          return resolvedData
        },
      },
    },
  }),

  Contributor: list({
    access: {
      operation: {
        query: allowAll, // WARNING: public
        create: adminOnly,
        update: contributorsOrAbove,
        delete: adminOnly,
      },
      filter: {
        // contributors can only update themselves
        update: forUsers({
          contributor: ({ session }) => ({ id: { equals: session.contributor.id } }),
          default: unfiltered,
        }),
      },
    },
    fields: {
      bio: text(),
      posts: relationship({
        ref: 'Post.createdBy',
        access: readOnlyBy(allowAll), // WARNING: usually you want this to be the same as Posts.createdBy
        many: true,
      }),
    },
  }),

  Moderator: list({
    access: {
      operation: {
        query: moderatorsOrAbove,
        create: adminOnly,
        update: moderatorsOrAbove,
        delete: adminOnly,
      },
      filter: {
        // moderators can only update themselves
        update: forUsers({
          moderator: ({ session }) => ({ id: { equals: session.moderator.id } }),
          // otherwise, no filter
          default: unfiltered,
        }),
      },
    },
    fields: {
      hidden: relationship({
        ref: 'Post.hiddenBy',
        access: readOnlyBy(allowAll), // WARNING: usually you want this to be the same as Posts.hiddenBy
        many: true,
      }),
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
} satisfies Lists<Session>
