import React from 'react';

import { InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import { lists } from '.keystone/api';

export default function HomePage({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
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
  const posts = await lists.Post.findMany({ resolveFields: false });
  return { props: { posts } };
}
