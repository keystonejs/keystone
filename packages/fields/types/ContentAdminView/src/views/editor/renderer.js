// @flow
import * as React from 'react';
import { useMemo } from 'react';
import Html from 'slate-html-serializer';

// any other things renderers should accept?
type RendererComponentProps = {
  // data contains things like the src value of an image and etc.
  data: Object,
  children: React.Node,
};

type Components = {
  [type: string]: (props: RendererComponentProps) => React.Node,
};

type ContentValue = any;

type Props = {
  value: ContentValue,
  // similar to react-select and etc. we'll define a
  // default value for the components which can render
  // all of the built in types but you can change
  // how built in types are rendered or set how a custom block type
  // should be rendered
  blocks: Components,
  inlines: Components,
};

export let blocks: Components = {
  paragraph: ({ children }) => <p>{children}</p>,
  image: props => <img src={props.data.src} />,
  'list-item': ({ children }) => <li>{children}</li>,
  'ordered-list': ({ children }) => <ol>{children}</ol>,
  'unordered-list': ({ children }) => <ul>{children}</ul>,
  heading: ({ children }) => <h2>{children}</h2>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
};

export let inlines: Components = {
  link: ({ children, data }) => <a href={data.get('href')}>{children}</a>,
};

export let Content = (props: Props) => {
  let serialize = useMemo(
    () => {
      let rules = [
        {
          serialize(obj, children) {
            if (obj.object === 'block') {
              let Comp = blocks[obj.type] || props.blocks[obj.type];
              if (!Comp) {
                return (
                  <div style={{ color: 'red' }}>
                    cannot render block of type: {obj.type} {children}
                  </div>
                );
              }
              return <Comp data={obj.data}>{children}</Comp>;
            }
            if (obj.object === 'inline') {
              let Comp = inlines[obj.type] || props.inlines[obj.type];
              if (!Comp) {
                return (
                  <div style={{ color: 'red' }}>
                    cannot render inline of type: {obj.type} {children}
                  </div>
                );
              }
              return <Comp data={obj.data}>{children}</Comp>;
            }

            if (obj.object == 'mark') {
              switch (obj.type) {
                case 'bold': {
                  return <strong>{children}</strong>;
                }
                case 'italic': {
                  return <em>{children}</em>;
                }
                case 'underline': {
                  return <u>{children}</u>;
                }
                case 'strikethrough': {
                  return <s>{children}</s>;
                }
              }
            }
          },
        },
      ];
      const html = new Html({ rules });
      return value => html.serialize(value, { render: false });
    },
    [props.blocks, props.inlines]
  );
  let serialized = useMemo(
    () => {
      return serialize(props.value);
    },
    [props.value]
  );

  return serialized;
};

Content.defaultProps = {
  inlines: {},
  blocks: {},
};

// <Content value={fromGraphql} components={components} />;

// how can we enforce that all block types are defined?
// a meta field in graphql that returns all the block types?

// (question for later) how should we handle passing related data in?
