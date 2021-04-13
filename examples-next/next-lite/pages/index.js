import React from 'react';
import Link from 'next/link';
// eslint-disable-next-line import/no-unresolved
import { lists } from '.keystone/api';

export default function HomePage({ posts }) {
  return (
    <div>
      <h1>Welcome to my blog</h1>
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

export async function getStaticProps() {
  const posts = await lists.Post.findMany({ query: 'slug title' });
  return { props: { posts } };
}
