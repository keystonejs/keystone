import { getContext } from '@keystone-6/core/context'
import { posts } from '../example-data'
import config from './keystone'
import * as PrismaModule from './generated/prisma/client'

type PostProps = {
  title: string
  status: 'draft' | 'published'
  publishDate: string
  author: string
  content: string
}

async function main() {
  const context = getContext(config, PrismaModule)

  console.log(`🌱 Inserting seed data`)
  const createPost = async (postData: PostProps) => {
    await context.query.Post.createOne({
      data: postData,
      query: 'id',
    })
  }

  for (const post of posts) {
    console.log(`📝 Adding post: ${post.title}`)
    await createPost(post)
  }

  console.log(`✅ Seed data inserted`)
  console.log(`👋 Please start the process with \`npm run dev\``)
}

main()
