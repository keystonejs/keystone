import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import React from 'react';
import { DocumentRenderer } from '@keystone-next/document-renderer';
import Link from 'next/link';
import { fetchGraphQL, gql } from '../../utils';

export default function Post({ author }: { author: any }) {
  return (
    <article>
      <h1>{author.name}</h1>
      <h2>Bio</h2>
      <DocumentRenderer document={author.bio?.document || []} />
      <h2>Posts</h2>
      {author.posts.map((post: any) => {
        return (
          <li key={post.id}>
            <Link href={`/post/${post.slug}`}>
              <a>{post.title}</a>
            </Link>
          </li>
        );
      })}
    </article>
  );
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await fetchGraphQL(gql`
    query {
      allAuthors {
        id
      }
    }
  `);
  return {
    paths: data.allAuthors.map((post: any) => ({
      params: { id: post.id },
    })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const data = await fetchGraphQL(
    gql`
      query ($id: ID!) {
        Author(where: { id: $id }) {
          name
          bio {
            document
          }
          posts {
            id
            title
            slug
          }
        }
      }
    `,
    { id: params!.id }
  );
  return {
    props: {
      author: data.Author,
    },
    revalidate: 60,
  };
}
