import React from 'react';

import { lists } from '.keystone/api';

export default function PostPage({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </div>
  );
}

export async function getStaticPaths(){
  const posts = await lists.Post.findMany({
    resolveFields: false,
  });

  const paths = posts
    .map(post => post.slug)
    .filter((slug): slug is string => !!slug)
    .map(slug => `/post/${slug}`);
  console.log(paths);
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const [post] = await lists.Post.findMany({
    where: { slug: slug as string },
    resolveFields: false,
  });
  return { props: { post } };
}
