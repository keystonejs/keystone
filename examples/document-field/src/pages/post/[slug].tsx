import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import Link from 'next/link';
import React from 'react';
import { DocumentRenderer, DocumentRendererProps } from '@keystone-next/document-renderer';
import { fetchGraphQL, gql } from '../../utils';

// by default the DocumentRenderer will render unstyled html elements
// we're customising how headings are rendered here but you can customise any of the renderers that the DocumentRenderer uses
const renderers: DocumentRendererProps['renderers'] = {
  block: {
    heading({ level, children, textAlign }) {
      const Comp = `h${level}` as const;
      return <Comp style={{ textAlign, textTransform: 'uppercase' }}>{children}</Comp>;
    },
  },
};

export default function Post({ post }: { post: any }) {
  return (
    <article>
      <h1>{post.title}</h1>
      {post.author?.name && (
        <address>
          By{' '}
          <Link href={`/author/${post.author.id}`}>
            <a>{post.author.name}</a>
          </Link>
        </address>
      )}
      {post.publishDate && (
        <span>
          on <time dateTime={post.publishDate}>{post.publishDate}</time>
        </span>
      )}
      {post.content?.document && (
        <DocumentRenderer document={post.content.document} renderers={renderers} />
      )}
    </article>
  );
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const data = await fetchGraphQL(gql`
    query {
      allPosts {
        slug
      }
    }
  `);
  return {
    paths: data.allPosts.map((post: any) => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
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
          publishDate
          author {
            id
            name
          }
        }
      }
    `,
    { slug: params!.slug }
  );
  return { props: { post: data.Post }, revalidate: 60 };
}
