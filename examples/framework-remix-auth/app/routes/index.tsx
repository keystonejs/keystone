import React from 'react';
import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { getSessionContext } from '../utils/keystone.server';

export const loader = async ({ request }: LoaderArgs) => {
  const context = await getSessionContext(request);
  return json({
    users: (await context.query.User.findMany({
      query: 'id email',
    })) as { id: string; email: string }[],
  });
};

export default function UsersIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {data.users.map(user => (
          <li key={user.id}>
            <p>{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
