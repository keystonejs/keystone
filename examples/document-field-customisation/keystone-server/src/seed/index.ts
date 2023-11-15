import fs from 'fs'
import path from 'path'
import { type Context } from '.keystone/types'

const seedUsers = async (context: Context) => {
  const { db } = context.sudo()
  const rawJSONData = fs.readFileSync(path.join(process.cwd(), './src/seed/users.json'), 'utf-8')
  const seedUsers: any[] = JSON.parse(rawJSONData)
  const usersAlreadyInDatabase = await db.User.findMany({
    where: {
      email: { in: seedUsers.map(user => user.email) },
    },
  })
  const usersToCreate = seedUsers.filter(
    seedUser => !usersAlreadyInDatabase.some(u => u.email === seedUser.email)
  )
  await db.User.createMany({
    data: usersToCreate,
  })
}

// seed posts and connect with users
const seedPosts = async (context: Context) => {
  const { db } = context.sudo()
  const rawJSONData = fs.readFileSync(path.join(process.cwd(), './src/seed/posts.json'), 'utf-8')
  const seedPosts: any[] = JSON.parse(rawJSONData)
  const postsAlreadyInDatabase = await db.Post.findMany({
    where: {
      slug: { in: seedPosts.map(post => post.slug) },
    },
  })
  const postsToCreate = seedPosts.filter(
    seedPost => !postsAlreadyInDatabase.some(p => p.slug === seedPost.slug)
  )
  await db.Post.createMany({
    data: postsToCreate.map(p => ({ ...p, content: p?.content?.document })),
  })
}

export const seedDatabase = async (context: Context) => {
  console.log(`🌱 Seeding database...`)
  await seedUsers(context)
  await seedPosts(context)
  console.log(`🌱 Seeding database completed.`)
}
