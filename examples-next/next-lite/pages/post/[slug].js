import React from 'react';

// eslint-disable-next-line import/no-unresolved
import { lists } from '.keystone/api';

export default function PostPage({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </div>
  );
}

export async function getStaticPaths() {
  const posts = await lists.Post.findMany({
    resolveFields: 'slug',
  });

  const paths = posts.map(post => post.slug).map(slug => `/post/${slug}`);
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const [post] = await lists.Post.findMany({
    where: { slug: slug },
    resolveFields: 'title content',
  });
  return { props: { post } };
}
