import React, { Fragment } from 'react';
import type { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import Link from 'next/link';
import { gql } from '@apollo/client';
import type { DocumentRendererProps } from '@keystone-6/document-renderer';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import { createApolloClient } from '../../apollo';

export type DocumentProp = DocumentRendererProps['document'];

type Post = {
  id: string;
  title: string;
  slug: string;
  publishDate: string | null;
  author: {
    name: string;
  } | null;
  content: {
    document: DocumentProp;
  };
};

export default function BlogPage({ post, error }: { post: Post | undefined; error?: Error }) {
  if (error) {
    return (
      <Fragment>
        <h1>Something went wrong</h1>
        <pre>{error.message}</pre>
      </Fragment>
    );
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <main>
      <div>
        <Link href="/">
          <a>&larr; back home</a>
        </Link>
      </div>
      <article>
        <h1>{post.title}</h1>
        <p>
          {post.publishDate ? (
            <span>
              <em>Published on {new Date(post.publishDate).toLocaleDateString()}</em>
            </span>
          ) : null}
          {post.author?.name ? (
            <span>
              <em> · by {post.author?.name}</em>
            </span>
          ) : null}
        </p>
        <DocumentRenderer document={post.content.document} />
      </article>
    </main>
  );
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const client = createApolloClient();
  try {
    const res = await client.query({
      query: gql`
        query posts {
          posts {
            slug
          }
        }
      `,
    });

    const posts: Array<{ slug: string }> = res?.data?.posts || [];
    const paths = posts.map(({ slug }) => ({
      params: { slug },
    }));

    return {
      paths,
      fallback: false,
    };
  } catch (e) {
    return {
      paths: [],
      fallback: false,
    };
  }
}

export async function getStaticProps({ params = {} }: GetStaticPropsContext) {
  const slug = params.slug;
  const client = createApolloClient();
  try {
    const res = await client.query({
      query: gql`
        query post($slug: String!) {
          post(where: { slug: $slug }) {
            id
            title
            slug
            publishDate
            author {
              name
            }
            content {
              document
            }
          }
        }
      `,
      variables: {
        slug,
      },
    });

    const post = res?.data?.post;
    return { props: { post } };
  } catch (e) {
    return {
      props: {
        post: undefined,
        error: { name: (e as Error).name, message: (e as Error).message },
      },
    };
  }
}
