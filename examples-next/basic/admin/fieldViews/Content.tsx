/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { component, fields, NotEditable } from '@keystone-next/fields-document/component-blocks';

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
      console.log(props);
      return (
        <div>
          <h1>{props.title}</h1>

          <NotEditable>
            <button
              onClick={() => {
                props.authors2.onChange(!props.authors2.discriminant);
              }}
            >
              Toggle Authors
            </button>

            <ul>
              {props.authors2.discriminant &&
                props.authors2.value.value.map(author => {
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
      authors2: fields.conditional(fields.checkbox({ label: 'Show authors' }), {
        true: fields.relationship<'many'>({ label: 'Authors', relationship: 'featuredAuthors' }),
        false: fields.empty(),
      }),
      // authors: fields.relationship<'many'>({ label: 'Authors', relationship: 'featuredAuthors' }),
    },
  }),
  panel: component({
    component: ({ content }) => {
      return <div>{content}</div>;
    },
    label: 'Component block Panel',
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
        <div>
          something
          <button
            onClick={() => {
              props.onRemove();
            }}
          >
            Remove
          </button>
        </div>
      );
    },
  }),
};
