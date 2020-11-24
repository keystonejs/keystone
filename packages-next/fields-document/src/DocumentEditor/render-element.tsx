/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { RenderElementProps } from 'slate-react';

import { renderQuoteElement } from './quote';
import { renderColumnsElement } from './columns';
import { ComponentBlocksElement, ComponentInlineProp } from './component-blocks';
import { PanelElement } from './panel';
import { LinkElement } from './link';
import { HeadingElement } from './heading';
import { BlockquoteElement } from './blockquote';
import { RelationshipElement } from './relationship';

export const renderElement = (props: RenderElementProps) => {
  // TODO: probably use this method for the access boundary as well, is this
  // a good pattern for plugging in custom element renderers?
  const quoteElement = renderQuoteElement(props);
  if (quoteElement) return quoteElement;

  const columnsElement = renderColumnsElement(props);
  if (columnsElement) return columnsElement;

  switch (props.element.type) {
    case 'code':
      return <CodeElement {...props} />;
    case 'component-block':
      return <ComponentBlocksElement {...props} />;
    case 'component-inline-prop':
      return <ComponentInlineProp {...props} />;
    case 'panel':
      return <PanelElement {...props} />;
    case 'heading':
      return <HeadingElement {...props} />;
    case 'link':
      return <LinkElement {...props} />;
    case 'ordered-list':
      return <ol {...props.attributes}>{props.children}</ol>;
    case 'unordered-list':
      return <ul {...props.attributes}>{props.children}</ul>;
    case 'list-item':
      return <li {...props.attributes}>{props.children}</li>;
    case 'blockquote':
      return <BlockquoteElement {...props} />;
    case 'relationship':
      return <RelationshipElement {...props} />;
    case 'divider':
      return (
        <div {...props.attributes}>
          <hr css={{ height: 4, backgroundColor: 'darkgray' }} />
          {props.children}
        </div>
      );
    default:
      return (
        <p css={{ textAlign: props.element.textAlign as any }} {...props.attributes}>
          {props.children}
        </p>
      );
  }
};

/* Block Elements */

const CodeElement = ({ attributes, children }: RenderElementProps) => {
  return (
    <pre css={{ color: '#2C5282' }} {...attributes}>
      <code>{children}</code>
    </pre>
  );
};
