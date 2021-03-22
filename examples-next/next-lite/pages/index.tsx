import React from 'react';

import { lists } from '.keystone/api';
import { Post } from '.keystone/types';

export default function HomePage({ posts }: { posts: Post[] }) {
  return (
    <div>
      <h1>Welcome to my blog</h1>
      <ul>
        {posts.map(post => (
          <li>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const posts = await lists.Post.findAll();
  return { posts };
}
