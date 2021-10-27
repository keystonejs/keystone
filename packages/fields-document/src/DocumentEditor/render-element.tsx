/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import { RenderElementProps, useSelected } from 'slate-react';

import { LayoutArea, LayoutContainer } from './layouts';
import { ComponentBlocksElement, ComponentInlineProp } from './component-blocks';
import { LinkElement } from './link';
import { HeadingElement } from './heading';
import { BlockquoteElement } from './blockquote';
import { RelationshipElement } from './relationship';

// some of the renderers read properties of the element
// and TS doesn't understand the type narrowing when doing a spread for some reason
// so that's why things aren't being spread in some cases
export const renderElement = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'layout':
      return (
        <LayoutContainer
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      );
    case 'layout-area':
      return <LayoutArea {...props} />;
    case 'code':
      return <CodeElement {...props} />;
    case 'component-block': {
      return (
        <ComponentBlocksElement
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      );
    }
    case 'component-inline-prop':
    case 'component-block-prop':
      return <ComponentInlineProp {...props} />;
    case 'heading':
      return (
        <HeadingElement
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      );
    case 'link':
      return (
        <LinkElement
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      );
    case 'ordered-list':
      return <ol {...props.attributes}>{props.children}</ol>;
    case 'unordered-list':
      return <ul {...props.attributes}>{props.children}</ul>;
    case 'list-item':
      return <li {...props.attributes}>{props.children}</li>;
    case 'list-item-content':
      return <span {...props.attributes}>{props.children}</span>;
    case 'blockquote':
      return <BlockquoteElement {...props} />;
    case 'relationship':
      return (
        <RelationshipElement
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      );
    case 'divider':
      return <DividerElement {...props} />;
    default:
      return (
        <p css={{ textAlign: props.element.textAlign }} {...props.attributes}>
          {props.children}
        </p>
      );
  }
};

/* Block Elements */

const CodeElement = ({ attributes, children }: RenderElementProps) => {
  const { colors, radii, spacing, typography } = useTheme();
  return (
    <pre
      spellCheck="false"
      css={{
        backgroundColor: colors.backgroundDim,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.xsmall,
        fontFamily: typography.fontFamily.monospace,
        fontSize: typography.fontSize.small,
        padding: `${spacing.small}px ${spacing.medium}px`,
      }}
      {...attributes}
    >
      <code css={{ fontFamily: 'inherit' }}>{children}</code>
    </pre>
  );
};

const DividerElement = ({ attributes, children }: RenderElementProps) => {
  const { colors, spacing } = useTheme();
  const selected = useSelected();
  return (
    <div
      {...attributes}
      css={{
        paddingBottom: spacing.medium,
        paddingTop: spacing.medium,
        marginBottom: spacing.medium,
        marginTop: spacing.medium,
        caretColor: 'transparent',
      }}
    >
      <hr
        css={{
          backgroundColor: selected ? colors.linkColor : colors.border,
          border: 0,
          height: 2,
        }}
      />
      {children}
    </div>
  );
};
