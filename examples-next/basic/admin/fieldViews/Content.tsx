/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { component, fields, NotEditable } from '@keystone-next/fields-document/component-blocks';
import { ReactNode } from 'react';

export const componentBlocks = {
  hero: component({
    component: HeroPreview,
    label: 'Hero',
    props: {
      title: fields.child(),
      content: fields.child(),
      imageSrc: fields.text({ label: 'Image URL' }),
      cta: fields.conditional(fields.checkbox({ label: 'Show CTA' }), {
        false: fields.empty(),
        true: fields.object({
          text: fields.child(),
          href: fields.text({
            label: 'Call to action link',
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
        false: fields.child(),
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
              {props.authors.map(author => {
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
      title: fields.child(),
      authors: fields.relationship<'many'>({ label: 'Authors', relationship: 'featuredAuthors' }),
    },
  }),
};

type HeroPreviewProps = {
  imageSrc: string;
  title: ReactNode;
  content: ReactNode;
  cta:
    | {
        discriminant: true;
        value: { text: ReactNode; href: string };
      }
    | { discriminant: false; value: undefined };
};

function HeroPreview(props: HeroPreviewProps) {
  return (
    <div>
      <div
        css={{
          backgroundColor: 'white',
          backgroundImage: `url(${props.imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontSize: 28,
          minHeight: 200,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <NotEditable>hello</NotEditable>
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
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            fontSize: 24,
            margin: 16,
            textShadow: '0px 1px 3px black',
          }}
        >
          {props.content}
        </div>
        {props.cta.discriminant ? (
          <div
            css={{
              display: 'inline-block',
              fontSize: 16,
              fontWeight: 'bold',
              color: '#002B55',
              backgroundColor: '#F9BF12',
              padding: '12px 16px',
              borderRadius: 6,
              margin: '16px auto',
            }}
          >
            {props.cta.value.text}
          </div>
        ) : null}
      </div>
    </div>
  );
}
