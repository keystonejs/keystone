import React from 'react';
import { getKeystoneSessionContext } from '../keystone/context';

export default async function Page() {
  const context = await getKeystoneSessionContext();
  const users = await context.query.User.findMany({
    query: 'id name email',
  });

  return (
    <div>
      <p>Open the console to see the output.</p>

      <div>
        <p>
          <strong>Users fetched from the server (in app directory)</strong>
        </p>
        <ol>
          {users.map(u => {
            return (
              <li key={u.id}>
                <span>{u.name} </span>
                {u.email ? (
                  <span>(email: {u.email})</span>
                ) : (
                  <span>(email: not authenticated)</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
