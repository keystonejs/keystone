import React, { Fragment } from 'react'
import Link from 'next/link'
import { fetchGraphQL, gql } from '../graphql'

type Post = {
  id: string
  title: string
  slug: string
  publishDate: string | null
  author: {
    name: string
  } | null
}

function PublishDate ({ publishDate }: { publishDate: Post['publishDate'] }) {
  const formattedDate = publishDate ? new Date(publishDate).toLocaleDateString() : null

  if (!formattedDate) {
    return null
  }
  return (
    <span>
      <em> · Published on {formattedDate}</em>
    </span>
  )
}

function AuthorInfo ({ author }: { author: Post['author'] }) {
  if (!author?.name) {
    return null
  }

  return (
    <span>
      <em> · by {author?.name}</em>
    </span>
  )
}

export default function Home ({ posts, error }: { posts: Post[], error?: Error }) {
  if (error) {
    return (
      <Fragment>
        <h1>Something went wrong</h1>
        <pre>{error.message}</pre>
      </Fragment>
    )
  }

  return (
    <main>
      <h1 style={{ margin: 0 }}>Posts</h1>
      <ul>
        {posts.map(post => {
          return (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              <PublishDate publishDate={post.publishDate} />
              <AuthorInfo author={post.author} />
            </li>
          )
        })}
      </ul>
    </main>
  )
}

export async function getStaticProps () {
  try {
    const data = await fetchGraphQL(gql`
      query posts {
        posts {
          id
          title
          slug
          publishDate
          author {
            name
          }
        }
      }
    `)

    const posts = data?.posts || []
    return {
      props: {
        posts,
      },
    }
  } catch (e) {
    return {
      props: {
        posts: [],
        error: { name: (e as Error).name, message: (e as Error).message },
      },
    }
  }
}
