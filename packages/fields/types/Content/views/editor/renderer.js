// @flow
import * as React from 'react';

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
};

let Content = (props: Props) => {
  // magic....
};

export let components: Components = {
  paragraph: ({ children }) => <p>{children}</p>,
  image: props => <img src={props.data.src} />,
  link: ({ children, data }) => <a href={data.href}>{children}</a>,
  'list-item': ({ children }) => <li>{children}</li>,
  'ordered-list': ({ children }) => <ol>{children}</ol>,
  'unordered-list': ({ children }) => <ul>{children}</ul>,
  heading: ({ children }) => <h2>{children}</h2>,
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
};

<Content value={fromGraphql} components={components} />;

// how can we enforce that all block types are defined?
// a meta field in graphql that returns all the block types?

// (question for later) how should we handle passing related data in?
