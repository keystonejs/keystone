import React from 'react';
import { withContext } from '../../with';

export default function PostPage({ post }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </div>
  );
}

export async function getStaticPaths() {
  const context = await withContext();
  const posts = await context.query.Post.findMany({
    query: 'slug',
  });

  const paths = posts.map(post => post.slug).map(slug => `/post/${slug}`);
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const context = await withContext();
  const [post] = await context.query.Post.findMany({
    where: { slug: { equals: slug } },
    query: 'title content',
  });
  return { props: { post } };
}
