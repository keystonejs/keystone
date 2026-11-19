import type { LoaderArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { keystoneContext } from '../utils/keystone.server'

export const loader = async ({ request }: LoaderArgs) => {
  // WARNING: this does nothing for now
  //   You will probably use Remix Sessions like in
  //   https://remix.run/docs/en/main/tutorials/jokes
  const session = {}
  const context = keystoneContext.withSession(session)
  const { posts }: { posts: { id: string; name: string | null; content: string | null }[] } =
    await context.graphql.run({
      query: '{ posts { id name content } }',
    })
  return json({ posts })
}

export default function UsersIndexRoute() {
  const data = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data.posts.map(post => (
          <li key={post.id}>
            <h1>{post.name}</h1>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
