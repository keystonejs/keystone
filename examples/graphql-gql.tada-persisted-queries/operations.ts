import { graphql } from './tada.ts'

const publicPostsDocument = graphql(`
  query PublicPosts($take: Int = 10) {
    posts(orderBy: { title: asc }, take: $take) {
      id
      title
    }
  }
`)

export const publicPostsQuery = graphql.persisted<typeof publicPostsDocument>(
  '7071ab8c8e86577597dd37576045dbf7ec4a7a64b4699fcfd9b553b97b718b4e'
)

const publicPostDocument = graphql(`
  query PublicPost($id: ID!) {
    post(where: { id: $id }) {
      id
      title
    }
  }
`)

export const publicPostQuery = graphql.persisted<typeof publicPostDocument>(
  '84b0d402d852b6dde989e0bec64efa51ef7229035dd7d2fe09f72b851a27f26e'
)
