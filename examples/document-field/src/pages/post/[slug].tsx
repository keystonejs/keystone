import { GetStaticPathsResult, GetStaticPropsContext } from 'next';
import React from 'react';
import { DocumentRenderer } from '@keystone-next/document-renderer';
import { InferRenderersForComponentBlocks } from '@keystone-next/fields-document/component-blocks';
import { fetchGraphQL, gql } from '../../utils';
import { componentBlocks } from '../../../document-field-view';

const componentBlockRenderers: InferRenderersForComponentBlocks<typeof componentBlocks> = {
  notice: function Notice(props) {
    return (
      <div style={{ border: '1px solid black' }}>
        {props.intent}:{props.content}
      </div>
    );
  },
};

export default function Index({ post }: { post: any }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <DocumentRenderer
        document={post.content?.document || []}
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
        }
      }
    `,
    { slug: params!.slug }
  );
  return {
    props: {
      post: data.Post,
    },
    revalidate: 1,
  };
}
