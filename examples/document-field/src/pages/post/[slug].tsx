import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import Link from 'next/link';
import React from 'react';
import { DocumentRenderer, DocumentRendererProps } from '@keystone-6/document-renderer';
import { fetchGraphQL, gql } from '../../utils';

// By default the DocumentRenderer will render unstyled html elements.
// We're customising how headings are rendered here but you can customise
// any of the renderers that the DocumentRenderer uses.
const renderers: DocumentRendererProps['renderers'] = {
  // Render heading blocks
  block: {
    heading({ level, children, textAlign }) {
      const Comp = `h${level}` as const;
      return <Comp style={{ textAlign, textTransform: 'uppercase' }}>{children}</Comp>;
    },
  },
  // Render inline relationships
  inline: {
    relationship({ relationship, data }) {
      // If there is more than one inline relationship defined on the document
      // field we need to handle each of them separately by checking the `relationship` argument.
      // It is good practice to include this check even if you only have a single inline relationship.
      if (relationship === 'mention') {
        if (data === null || data.data === undefined) {
          // data can be null if the content writer inserted a mention but didn't select an author to mention.
          // data.data can be undefined if the logged in user does not have permission to read the linked item
          // or if the linked item no longer exists.
          return <span>[unknown author]</span>;
        } else {
          // If the data exists then we render the mention as a link to the author's bio.
          // We have access to `id` an `name` fields here because we named them in the
          // `selection` config argument.
          return <Link href={`/author/${data.data.id}`}>{data.data.name}</Link>;
        }
      }
      return null;
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
      posts {
        slug
      }
    }
  `);
  return {
    paths: data.posts.map((post: any) => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  // We use (hydrateRelationships: true) to ensure we have the data we need
  // to render the inline relationships.
  const data = await fetchGraphQL(
    gql`
      query ($slug: String!) {
        post(where: { slug: $slug }) {
          title
          content {
            document(hydrateRelationships: true)
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
  return { props: { post: data.post }, revalidate: 60 };
}
