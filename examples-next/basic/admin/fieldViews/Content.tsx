/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { Tooltip } from '@keystone-ui/tooltip';
import { component, fields, NotEditable } from '@keystone-next/fields-document/component-blocks';
import {
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from '@keystone-next/fields-document/primitives';

export const componentBlocks = {
  hero: component({
    component: props => {
      return (
        <div
          css={{
            backgroundColor: 'white',
            backgroundImage: `url(${props.imageSrc.value})`,
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
            <div
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
            </div>
          ) : null}
        </div>
      );
    },
    label: 'Hero',
    props: {
      title: fields.child({ kind: 'inline' }),
      content: fields.child({ kind: 'block' }),
      imageSrc: fields.text({
        label: 'Image URL',
        defaultValue: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
      }),
      cta: fields.conditional(fields.checkbox({ label: 'Show CTA' }), {
        false: fields.empty(),
        true: fields.object({
          text: fields.child({ kind: 'inline' }),
          href: fields.text({
            label: 'Call to action link',
            defaultValue: '#',
          }),
        }),
      }),
    },
  }),
  void: component({
    label: 'Void',
    component: ({ value }) => <NotEditable>{value}</NotEditable>,
    props: { value: fields.text({ label: 'Value' }) },
  }),
  conditionallyVoid: component({
    label: 'Conditionally Void',
    component: ({ something }) =>
      something.discriminant ? <NotEditable>Is void</NotEditable> : <div>{something.value}</div>,
    props: {
      something: fields.conditional(fields.checkbox({ label: 'Is void' }), {
        false: fields.child({ kind: 'inline' }),
        true: fields.empty(),
      }),
    },
  }),
  featuredAuthors: component({
    label: 'Featured Authors',
    component: props => {
      return (
        <div>
          <h1>{props.title}</h1>
          <NotEditable>
            <ul>
              {props.authors.value.map(author => {
                return (
                  <li>
                    {author.label}
                    <ul>
                      {author.data.posts.map((post: { title: string | null }) => {
                        return <li>{post.title}</li>;
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </NotEditable>
        </div>
      );
    },
    props: {
      title: fields.child({ kind: 'inline' }),
      authors: fields.relationship<'many'>({ label: 'Authors', relationship: 'featuredAuthors' }),
    },
  }),
  panel: component({
    component: ({ content }) => {
      return <div>{content}</div>;
    },
    label: 'Component block Panel',
    unwrapOnBackspaceAtStart: true,
    exitOnEnterInEmptyLineAtEndOfChild: true,
    props: {
      intent: fields.select({
        label: 'Intent',
        options: [{ value: 'note', label: 'Note' }],
        defaultValue: 'note',
      }),
      content: fields.child({ kind: 'block' }),
    },
    chromeless: true,
    toolbar(props) {
      return (
        <ToolbarGroup>
          <ToolbarButton>Action</ToolbarButton>
          <ToolbarSeparator />
          <Tooltip content="Remove" weight="subtle">
            {attrs => (
              <ToolbarButton
                variant="destructive"
                onClick={() => {
                  props.onRemove();
                }}
                {...attrs}
              >
                <Trash2Icon size="small" />
              </ToolbarButton>
            )}
          </Tooltip>
        </ToolbarGroup>
      );
    },
  }),
  quote: component({
    component: ({ attribution, content }) => {
      return (
        <div
          css={{
            borderLeft: '3px solid #CBD5E0',
            paddingLeft: 16,
          }}
        >
          <div css={{ fontStyle: 'italic', color: '#4A5568' }}>{content}</div>
          <div css={{ fontWeight: 'bold', color: '#718096' }}>
            <span
              contentEditable={false}
              style={{
                userSelect: 'none',
              }}
            >
              —{' '}
            </span>
            {attribution}
          </div>
        </div>
      );
    },
    label: 'Component block Quote',
    unwrapOnBackspaceAtStart: true,
    exitOnEnterInEmptyLineAtEndOfChild: true,
    props: {
      content: fields.child({ kind: 'block' }),
      attribution: fields.child({ kind: 'inline' }),
    },
    chromeless: true,
  }),
};
