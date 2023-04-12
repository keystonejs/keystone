import React from 'react';
import { keystoneContext } from '../keystone/context';
import { DocumentRender } from './DocumentRender';

export default async function HomePage() {
  /*
    `keystoneContext` object doesn't have user's session information.
    You need an authenticated context to CRUD data behind access control.
    keystoneContext.withSession(session) - passing in a session object that
    aligns with your access control - gives you a `context` object with
    session info and an elevated sudo context to bypass access control if needed (context.sudo()).
  */
  const users = await keystoneContext.query.User.findMany({
    query: 'id name about { document }',
  });
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
                {u.about?.document.length > 1 && (
                  <>
                    <hr />
                    <DocumentRender document={u.about?.document} />
                  </>
                )}
              </li>
            );
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
        <a href="https://github.com/keystonejs/keystone/tree/main/examples/nextjs-keystone-app-directory">
          Check out the example in the repo more info.
        </a>
      </p>
    </section>
  );
}
