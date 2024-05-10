import { type Context } from '.keystone/types'
import { posts, tags } from '../../../example-data'

const seedTags = async (context: Context) => {
  const { db } = context.sudo()
  const alreadyInDatabase = await db.Tag.findMany({
    where: {
      title: { in: tags.map(x => x.title) },
    },
  })
  const toCreate = tags.filter(
    seed => !alreadyInDatabase.some(x => x.title === seed.title)
  )
  await db.Tag.createMany({
    data: toCreate,
  })
}

// seed posts and connect with users
const seedPosts = async (context: Context) => {
  const { db } = context.sudo()
  const alreadyInDatabase = await db.Post.findMany({
    where: {
      title: { in: posts.map(x => x.title) },
    },
  })
  const toCreate = posts.filter(
    seed => !alreadyInDatabase.some(x => x.title === seed.title)
  )
  await db.Post.createMany({
    data: toCreate.map(x => ({
      title: x.title,
      content: x.content,
      listed: x.status === "published",
      tags: tags.
        sort(() => Math.random() - 0.5).
        slice(0, Math.floor(Math.random() * 3) + 1)
    })),
  })
}

export const seedDatabase = async (context: Context) => {
  console.log(`🌱 Seeding database...`)
  await seedTags(context)
  await seedPosts(context)
  console.log(`🌱 Seeding database completed.`)
}
