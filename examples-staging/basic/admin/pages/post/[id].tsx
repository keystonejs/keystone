/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, useTheme } from '@keystone-ui/core';
import { useRouter } from '@keystone-next/keystone/admin-ui/router';
import { gql, useQuery } from '@keystone-next/keystone/admin-ui/apollo';
import { DocumentRenderer } from '@keystone-next/document-renderer';
import { InferRenderersForComponentBlocks } from '@keystone-next/fields-document/component-blocks';

import { InfoIcon } from '@keystone-ui/icons/icons/InfoIcon';
import { AlertTriangleIcon } from '@keystone-ui/icons/icons/AlertTriangleIcon';
import { AlertOctagonIcon } from '@keystone-ui/icons/icons/AlertOctagonIcon';
import { CheckCircleIcon } from '@keystone-ui/icons/icons/CheckCircleIcon';

type ComponentBlockRenderers = InferRenderersForComponentBlocks<
  typeof import('../../fieldViews/Content').componentBlocks
>;

const componentBlockRenderers: ComponentBlockRenderers = {
  hero: props => (
    <div
      css={{
        backgroundColor: 'white',
        backgroundImage: `url(${props.imageSrc})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 28,
        justifyContent: 'space-between',
        minHeight: 200,
        padding: 16,
        width: '100%',
      }}
    >
      <div
        css={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: 48,
          textAlign: 'center',
          margin: 16,
          textShadow: '0px 1px 3px black',
        }}
      >
        {props.title}
      </div>
      <div
        css={{
          color: 'white',
          fontSize: 24,
          fontWeight: 'bold',
          margin: 16,
          textAlign: 'center',
          textShadow: '0px 1px 3px black',
        }}
      >
        {props.content}
      </div>
      {props.cta.discriminant ? (
        <button
          css={{
            backgroundColor: '#F9BF12',
            borderRadius: 6,
            color: '#002B55',
            display: 'inline-block',
            fontSize: 16,
            fontWeight: 'bold',
            margin: '16px auto',
            padding: '12px 16px',
          }}
        >
          {props.cta.value.text}
        </button>
      ) : null}
    </div>
  ),
  conditionallyVoid: props => <span>{props.something.value}</span>,
  featuredAuthors: props => (
    <div>
      <h3>{props.title}</h3>
      <ul>
        {props.authors.map((author, i) => {
          return (
            <li key={i}>
              {author.label}
              <ul>
                {author.data.posts.map((post: any, i: number) => {
                  return <li key={i}>{post.title}</li>;
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  ),
  notice: function Notice({ content, intent }) {
    const { palette, radii, spacing } = useTheme();

    const intentMap = {
      info: {
        background: palette.blue100,
        foreground: palette.blue700,
        icon: InfoIcon,
      },
      error: {
        background: palette.red100,
        foreground: palette.red700,
        icon: AlertOctagonIcon,
      },
      warning: {
        background: palette.yellow100,
        foreground: palette.yellow700,
        icon: AlertTriangleIcon,
      },
      success: {
        background: palette.green100,
        foreground: palette.green700,
        icon: CheckCircleIcon,
      },
    };
    const intentConfig = intentMap[intent];

    return (
      <div
        css={{
          borderRadius: radii.small,
          display: 'flex',
          paddingLeft: spacing.medium,
          paddingRight: spacing.medium,
        }}
        style={{
          background: intentConfig.background,
        }}
      >
        <div
          css={{
            color: intentConfig.foreground,
            marginRight: spacing.small,
            marginTop: '1em',
          }}
        >
          <intentConfig.icon />
        </div>
        <div css={{ flex: 1 }}>{content}</div>
      </div>
    );
  },
  quote: ({ attribution, content }) => {
    return (
      <div
        css={{
          borderLeft: '3px solid #CBD5E0',
          paddingLeft: 16,
        }}
      >
        <div css={{ fontStyle: 'italic', color: '#4A5568' }}>{content}</div>
        <div css={{ fontWeight: 'bold', color: '#718096' }}>
          <span>— </span>
          {attribution}
        </div>
      </div>
    );
  },
  void: props => <span>{props.value}</span>,
};

export default function Post() {
  const id = useRouter().query.id;
  const { data, error } = useQuery(
    gql`
      query Post($id: ID!) {
        Post(where: { id: $id }) {
          id
          title
          author {
            id
            name
          }
          content {
            document(hydrateRelationships: true)
          }
        }
      }
    `,
    { variables: { id } }
  );
  if (error) {
    return 'Error...';
  }
  if (!data) {
    return 'Loading...';
  }
  const post = data.Post;
  return (
    <div css={{ display: 'flex', justifyContent: 'center' }}>
      <article css={{ maxWidth: 800, flex: 1 }}>
        <h1>{post.title}</h1>
        <address>{post.author?.name}</address>
        <div css={{ whiteSpace: 'pre-wrap' }}>
          <DocumentRenderer<ComponentBlockRenderers>
            componentBlocks={componentBlockRenderers}
            document={post.content.document}
          />
        </div>
      </article>
    </div>
  );
}
