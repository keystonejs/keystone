import React from 'react';
import { getKeystoneSessionContext } from '../keystone/context';

export default async function Page() {
  const context = await getKeystoneSessionContext();
  const posts = await context.query.Post.findMany({
    query: 'id name content',
  });

  return (
    <div>
      <p>Open the console to see the output.</p>

      <div>
        <p>
          <strong>Users fetched from the server (in app directory)</strong>
        </p>
        <ol>
          {posts.map(p => {
            return (
              <li key={p.id}>
                <span>{p.name} </span>
                <span>(content: {p.content})</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
