import { GetStaticPropsContext } from 'next';
import Link from 'next/link';
import React from 'react';
import { DocumentRenderer } from '@keystone-next/document-renderer';
import { fetchGraphQL, gql } from '../../utils';

export default function Index({ post }: { post: any }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <
    </article>
  );
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const data = await fetchGraphQL(
    gql`
      query ($slug: String!) {
        Post(where: { slug: $slug }) {
          title
          content {
            document
          }
        }
      }
    `,
    { slug: params!.slug }
  );
  return {
    props: {
      posts: data.allPosts,
    },
    revalidate: 1,
  };
}
