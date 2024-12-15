import { getContext } from '@keystone-6/core/context'
import config from './keystone'
import * as PrismaModule from 'myprisma'

async function main () {
  const context = getContext(config, PrismaModule)

  console.log('seeding data')
  const run = Math.random().toString(36).slice(2)

  for (let i = 0; i < 1e5; ++i) {
    console.log(`...Post.createOne ${i}`)
    await context.db.Post.createOne({ data: { title: `Post #${i}, run ${run}` } })
  }
}

main()
