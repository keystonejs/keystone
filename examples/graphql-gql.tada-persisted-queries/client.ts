import type { ResultOf, VariablesOf } from 'gql.tada'
import { publicPostQuery, publicPostsQuery } from './operations.ts'

const apiUrl = process.argv[2] ?? 'http://localhost:3000/api/graphql'

async function persistedFetch<Document extends { documentId: string }>(
  document: Document,
  variables: VariablesOf<Document>
): Promise<ResultOf<Document>> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      variables,
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: document.documentId,
        },
      },
    }),
  })
  const result = (await response.json()) as {
    data?: ResultOf<Document>
    errors?: { message: string }[]
  }

  if (!response.ok || result.errors?.length) {
    throw new Error(result.errors?.map(error => error.message).join('\n') ?? response.statusText)
  }
  if (result.data === undefined) throw new Error('The GraphQL response contained no data')

  return result.data
}

const posts = await persistedFetch(publicPostsQuery, { take: 5 })
console.log('Posts:', posts.posts)

const firstPost = posts.posts?.[0]
if (firstPost) {
  const post = await persistedFetch(publicPostQuery, { id: firstPost.id })
  console.log('First post:', post.post)
}
