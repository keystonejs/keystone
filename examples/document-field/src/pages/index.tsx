import Link from 'next/link'
import React from 'react'
import { fetchGraphQL, gql } from '../utils'

type Author = { id: string, name: string, posts: { id: string, slug: string, title: string }[] }

export default function Index ({ authors }: { authors: Author[] }) {
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

export async function getStaticProps () {
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
  return { props: { authors: data.authors }, revalidate: 30 }
}
