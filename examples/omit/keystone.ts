import { config } from '@keystone-6/core'
import { lists } from './schema'
import type { Context } from '.keystone/types'

export default config({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    onConnect: async (context: Context) => {
      if ((await context.db.Person.count()) > 0) return

      const people = []
      for (let i = 0; i < 5; ++i) {
        people.push(await context.db.Person.createOne({ data: { name: `Person #${i}` } }))
      }

      for (const { id } of people) {
        // TODO: should work with .sudo()
        //   await context.sudo().db.Nice.createOne({
        await context.prisma.priority.create({
          data: {
            person: {
              connect: {
                id,
              },
            },
          },
        })

        await context.prisma.nice.create({
          data: {
            person: {
              connect: {
                id,
              },
            },
          },
        })

        await context.prisma.naughty.create({
          data: {
            person: {
              connect: {
                id,
              },
            },
          },
        })
      }
    },

    // WARNING: this is only needed for our monorepo examples, dont do this
    prismaClientPath: 'node_modules/myprisma',
  },
  lists,
})
