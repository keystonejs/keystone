import React from 'react';
import { GetStaticPropsContext } from 'next';

import { lists } from '.keystone/api';
import { Post } from '.keystone/types';

export default function PostPage({ post }: { post: Post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </div>
  );
}

export async function getStaticProps({ params: { slug } }: GetStaticPropsContext) {
  const posts = await lists.Post.findOne({ where: { slug } });
  return { posts };
}
