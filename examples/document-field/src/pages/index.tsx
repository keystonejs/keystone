import Link from 'next/link';
import React from 'react';
import { fetchGraphQL, gql } from '../utils';

export default function Index({ posts }: { posts: any[] }) {
  return (
    <ul>
      {posts.map(post => {
        return (
          <li key={post.id}>
            <Link href={`/post/${post.slug}`}>
              <a>{post.title}</a>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export async function getStaticProps() {
  const data = await fetchGraphQL(gql`
    query {
      allPosts(where: { status: published }, orderBy: { publishDate: desc }) {
        id
        slug
        title
      }
    }
  `);
  return {
    props: {
      posts: data.allPosts,
    },
    revalidate: 30,
  };
}
