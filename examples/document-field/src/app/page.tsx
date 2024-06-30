import Link from 'next/link'
import React from 'react'
import { fetchGraphQL, gql } from '../utils'

type Author = { id: string, name: string, posts: { id: string, slug: string, title: string }[] }

export default async function Index () {
  const data = await fetchGraphQL(gql`
    query {
      authors {
        id
        name
        posts(where: { status: { equals: published } }, orderBy: { publishDate: desc }) {
          id
          slug
          title
        }
      }
    }
  `)

  const authors: Author[] = data?.authors || []

  return (
    <>
      <h1>Keystone Blog Project - Home</h1>
      <ul>
        {authors.map(author => (
          <li key={author.id}>
            <h2>
              <Link href={`/author/${author.id}`}>{author.name}</Link>
            </h2>
            <ul>
              {author.posts.map(post => (
                <li key={post.id}>
                  <Link href={`/post/${post.slug}`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  )
}
