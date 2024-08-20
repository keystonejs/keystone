import { config } from '@keystone-6/core'
import { lists, type Session } from './schema'
import type { Context, TypeInfo } from '.keystone/types'

const sillySessionStrategy = {
  async get ({ context }: { context: Context }): Promise<Session | undefined> {
    if (!context.req) return

    // WARNING: for demonstrative purposes only, this has no authentication
    //   use `Cookie:user=clh9v6pcn0000sbhm9u0j6in0` for Alice (admin)
    //   use `Cookie:user=clh9v762w0002sbhmhhyc0340` for Bob (moderator)
    //   use `Cookie:user=clh9v7ahs0004sbhmpx30w85n` for Eve (contributor)
    //
    // in practice, you should use authentication for your sessions, such as OAuth or JWT
    const { cookie = '' } = context.req.headers
    const [cookieName, id] = cookie.split('=')
    if (cookieName !== 'user') return

    const who = await context.sudo().db.User.findOne({ where: { id } })
    if (!who) return
    return {
      id,
      admin: who.admin,
      moderator: who.moderatorId ? { id: who.moderatorId } : null,
      contributor: who.contributorId ? { id: who.contributorId } : null,
    }
  },

  // we don't need these unless we want to support the functions
  //   context.sessionStrategy.start
  //   context.sessionStrategy.end
  //
  async start () {},
  async end () {},
}

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
  session: sillySessionStrategy,
})
