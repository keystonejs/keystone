import React from 'react'
import { keystoneContext } from '../keystone/context'
import { DocumentRender } from './DocumentRender'

export default async function HomePage () {
  // WARNING: this does nothing for now
  //   you will probably use getServerSession from 'next/auth'
  //   https://next-auth.js.org/configuration/nextjs#in-app-directory
  const session = {}
  const users = await keystoneContext.withSession(session).query.User.findMany({
    query: 'id name about { document }',
  })

  return (
    <section>
      <h1>Keystone 🤝 Next.js</h1>
      <ul>
        <li>Below you can see the names of users in the database.</li>
      </ul>

      <div>
        <p>
          <strong>Users fetched from the server</strong>
        </p>
        <ol>
          {users.map(u => {
            return (
              <li key={u.id}>
                <span>{u.name} </span>
                {u.about && (
                  <>
                    <hr />
                    <DocumentRender document={u.about?.document} />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <h2>How does it work?</h2>

      <p>
        Keystone's APIs can be seamlessly composed to work as a powerful data engine within Next.js
        applications without having to host a separate Keystone server. This is made possible by
        Keystone&apos;s `getContext` API.
      </p>
      <p>
        <em>
          Note: Since you are not starting the keystone server, the Admin UI will not be available.
          You can host Keystone as a separate server if you need Admin UI.
        </em>
      </p>
      <p>
        <a href="https://github.com/keystonejs/keystone/tree/main/examples/framework-nextjs-app-directory">
          Check out the example in the repo more info.
        </a>
      </p>
    </section>
  )
}
