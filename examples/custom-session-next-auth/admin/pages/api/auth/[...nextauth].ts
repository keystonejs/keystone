import NextAuth, { DefaultUser } from 'next-auth'
import { nextAuthOptions } from '../../../../session'
// WARNING: this is only needed for our monorepo examples, dont do this
import * as Prisma from 'myprisma'
// import * as Prisma from '@prisma/client' // <-- do this
import { getContext } from '@keystone-6/core/context'
import keystoneConfig from '../../../../keystone'
import type { Context } from '.keystone/types'

let _keystoneContext: Context = (globalThis as any)._keystoneContext

async function getKeystoneContext() {
  if (_keystoneContext) return _keystoneContext

  _keystoneContext = getContext(keystoneConfig, Prisma)
  if (process.env.NODE_ENV !== 'production') {
    ;(globalThis as any)._keystoneContext = _keystoneContext
  }
  return _keystoneContext
}

export default NextAuth({
  ...nextAuthOptions,
  callbacks: {
    ...nextAuthOptions.callbacks,
    async signIn({ user }: { user: DefaultUser }) {
      // console.error('next-auth signIn', { user, account, profile });
      const sudoContext = (await getKeystoneContext()).sudo()

      // check if the user exists in keystone
      const author = await sudoContext.query.Author.findOne({
        where: { authId: user.id },
      })

      // if not, sign up
      if (!author) {
        await sudoContext.query.Author.createOne({
          data: {
            authId: user.id,
            name: user.name,
          },
        })
      }

      return true // accept the signin
    },
  },
})
