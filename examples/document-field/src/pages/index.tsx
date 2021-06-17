import Link from 'next/link';
import React from 'react';
import { fetchGraphQL, gql } from '../utils';

export default function Index({ posts }: { posts: any[] }) {
  return (
    <ul>
      {posts.map(post => {
        return (
          <li>
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
      allPosts(where: { publishStatus: published }, orderBy: { publishDate: desc }) {
        slug
        title
      }
    }
  `);
  return {
    props: {
      posts: data.allPosts,
    },
    revalidate: 1,
  };
}
