import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '../requestAuth';
// eslint-disable-next-line import/no-unresolved
import { lists } from '.keystone/api';

export default function HomePage({ posts, authedUser }) {
  return (
    <div>
      <Image src="/logo.svg" width="38" height="38" alt="Keystone" />
      <h1 style={{ display: 'inline', marginLeft: '10px', verticalAlign: 'top' }}>
        Welcome to my blog{authedUser && `, ${authedUser.name}`}
      </h1>
      <ul>
        {posts.map((post, i) => (
          <li key={i}>
            <Link href={`/post/${post.slug}`}>
              <a>{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const authedUser = await getCurrentUser(req);
  const posts = await lists.Post.findMany({ query: 'slug title' });
  return { props: { posts, authedUser } };
}
