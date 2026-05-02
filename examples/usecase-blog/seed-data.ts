import { getContext } from '@keystone-6/core/context'
import { authors, posts } from '../example-data'
import config from './keystone'
import * as PrismaModule from 'myprisma'

async function main() {
  const context = getContext(config, PrismaModule)

  console.log(`🌱 Inserting seed data`)
  for (const author of authors) {
    console.log(`👩 Adding author: ${author.name}`)
    const item = await context.db.Author.findOne({
      where: { email: author.email },
    })

    if (!item) {
      await context.db.Author.createOne({
        data: author,
      })
    }
  }

  for (const post of posts) {
    console.log(`📝 Adding post: ${post.title}`)

    const authors = await context.db.Author.findMany({
      where: { name: { equals: post.author } },
    })

    if (authors.length === 0) {
      console.warn(`⚠️ No author found for post: ${post.title}`)
      continue
    }

    const { author, content, ...postData } = post

    await context.db.Post.createOne({
      data: {
        ...postData,
        content: [{ type: 'paragraph', children: [{ text: content }] }],
        author: { connect: { id: authors[0].id } },
      },
    })
  }

  console.log(`✅ Seed data inserted`)
  console.log(`👋 Please start the process with \`npm run dev\``)
}

main()
