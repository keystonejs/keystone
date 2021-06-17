import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import React from 'react';
import { DocumentRenderer, DocumentRendererProps } from '@keystone-next/document-renderer';
import { InferRenderersForComponentBlocks } from '@keystone-next/fields-document/component-blocks';
import Link from 'next/link';
import { fetchGraphQL, gql } from '../../utils';
import { componentBlocks } from '../../../document-field-view';

// this type will infer the props of so your component block renderers will know what they'll recieve
// note that there are no strong guarantees that what this type says is actually what you will recieve though
// because while the document field will validate that the document passed when doing an update or delete is valid
// it does not validate it when reading it so if you change your existing component blocks without migrating
// or you set the document value directly in your database bypassing Keystone, the content may be invalid
// and the arguments you get here may not be what the types say
const componentBlockRenderers: InferRenderersForComponentBlocks<typeof componentBlocks> = {
  notice: function Notice(props) {
    return (
      <div style={{ border: '1px solid black' }}>
        {props.intent}:{props.content}
      </div>
    );
  },
};

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
      <DocumentRenderer
        document={post.content?.document || []}
        renderers={renderers}
        componentBlocks={componentBlockRenderers}
      />
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
    paths: data.allPosts.map((post: any) => ({
      params: { slug: post.slug },
    })),
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
  return {
    props: {
      post: data.Post,
    },
    revalidate: 60,
  };
}
