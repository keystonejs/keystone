import React from 'react';
import Link from 'next/link';
// eslint-disable-next-line import/no-unresolved
import { withContext } from '../with';

export default function HomePage({ posts }) {
  return (
    <div>
      <h1>Welcome to my blog</h1>
      <ul>
        {posts.map((post, i) => (
          <li key={i}>
            <Link href={`/post/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const context = await withContext();
  const posts = await context.query.Post.findMany({ query: 'slug title' });
  return { props: { posts } };
}
