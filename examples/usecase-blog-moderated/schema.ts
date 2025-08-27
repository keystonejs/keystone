import type { Context, Lists } from '.keystone/types'
import { gWithContext, list } from '@keystone-6/core'
import { allowAll, denyAll, unfiltered } from '@keystone-6/core/access'
import { checkbox, relationship, text, timestamp, virtual } from '@keystone-6/core/fields'

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
  [key in keyof T]: key extends K ? Exclude<T[key], null | undefined> : T[key]
}

function isAdmin<T extends Session>(session?: T): session is T & { admin: true } {
  return session?.admin === true
}
function isModerator<T extends Session>(session?: T): session is Has<T, 'moderator'> {
  return session?.moderator !== null
}
function isContributor<T extends Session>(session?: T): session is Has<T, 'contributor'> {
  return session?.contributor !== null
}

function forUsers<T>({
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

function readOnlyBy(f: ({ session }: { session?: Session }) => boolean) {
  return {
    read: f,
    create: denyAll,
    update: denyAll,
  }
}

function systemField(f: ({ session }: { session?: Session }) => boolean) {
  return {
    access: {
      read: f,
      create: denyAll,
      update: denyAll,
    },
    graphql: {
      omit: {
        create: true,
        update: true,
      },
    },
    ui: {
      createView: {
        fieldMode: 'hidden' as const,
      },
      itemView: {
        fieldMode: (args: { session?: Session }) =>
          f(args) ? ('read' as const) : ('hidden' as const),
        fieldPosition: 'sidebar' as const,
      },
      listView: {
        fieldMode: (args: { session?: Session }) =>
          f(args) ? ('read' as const) : ('hidden' as const),
      },
    },
  }
}

const g = gWithContext<Context>()
type g<T> = gWithContext.infer<T>

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

      // read only fields
      createdBy: relationship({
        ref: 'Contributor.posts',
        ...systemField(allowAll),
      }),
      createdAt: timestamp({ ...systemField(allowAll) }),
      updatedAt: timestamp({ ...systemField(allowAll) }),
      hiddenBy: relationship({
        ref: 'Moderator.hidden',
        ...systemField(moderatorsOrAbove),
      }),
      hiddenAt: timestamp({ ...systemField(moderatorsOrAbove) }),

      moderatedBy: virtual({
        access: readOnlyBy(allowAll), // WARNING: public
        field: g.field({
          type: g.object<{
            name: string
          }>()({
            name: 'ModeratedBy',
            fields: {
              name: g.field({ type: g.String }),
            },
          }),
          async resolve(item, _, context) {
            if (!item.hiddenById) return null
            return await context.db.User.findOne({
              where: {
                moderator: {
                  id: item.hiddenById,
                },
              },
            })
          },
        }),
        ui: {
          query: '{ name }',
        },
      }),
    },
    hooks: {
      resolveInput: {
        create: ({ context: { session }, resolvedData }) => {
          return {
            ...resolvedData,
            createdAt: new Date(),
            ...(isContributor(session)
              ? {
                  createdBy: {
                    connect: { id: session.contributor.id },
                  },
                }
              : {}),
          }
        },
        update: ({ resolvedData }) => {
          return {
            ...resolvedData,
            updatedAt: new Date(),
          }
        },
      },
    },

    actions: {
      // flagPost
      flag: {
        access: moderatorsOrAbove,
        // null redirects the page, otherwise it updates the page
        async resolve({ where }, context) {
          return await context.db.Post.updateOne({
            where,
            data: {
              ...(isModerator(context.session)
                ? {
                    hiddenBy: {
                      connect: { id: context.session.moderator.id },
                    },
                  }
                : null),
              hiddenAt: new Date(),
            },
          })
        },
        ui: {
          label: 'Flag',
          icon: 'flagIcon',
          messages: {
            promptTitle: 'Flag {itemLabel}',
            promptTitleMany: 'Flag {count} {singular|plural}',
            prompt: 'Are you sure you want to flag "{itemLabel}"?',
            promptMany: 'Are you sure you want to flag {count} {singular|plural}?',
            promptConfirmLabel: 'Yes, flag this {singular}',
            promptConfirmLabelMany: 'Yes, flag {count} {singular|plural}',
            fail: 'Could not flag {singular}',
            failMany: 'Could not flag {countFail} {singular|plural}',
            success: 'Flagged "{itemLabel}"',
            successMany: 'Successfully flagged {countSuccess} {singular|plural}',
          },
          itemView: {
            actionMode: ({ session }) => {
              if (isModerator(session)) return 'enabled'
              if (isAdmin(session)) return 'disabled'
              return 'hidden'
            },
          },
          listView: {
            actionMode: ({ session }) => {
              if (isModerator(session)) return 'enabled'
              return 'hidden'
            },
          },
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
      user: relationship({
        ref: 'User.contributor',
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
      user: relationship({
        ref: 'User.moderator',
      }),
    },
  }),

  User: list({
    access: adminOnly,
    fields: {
      name: text(),
      admin: checkbox(),
      contributor: relationship({
        ref: 'Contributor.user',
        db: {
          foreignKey: true,
        },
      }),
      moderator: relationship({
        ref: 'Moderator.user',
        db: {
          foreignKey: true,
        },
      }),
    },
  }),
} satisfies Lists<Session>
