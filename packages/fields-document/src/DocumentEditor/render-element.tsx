import { type RenderElementProps, useSelected } from 'slate-react'

import { LayoutArea, LayoutContainer } from './layouts.tsx'
import { ComponentBlocksElement, ComponentInlineProp } from './component-blocks/index.tsx'
import { LinkElement } from './link.tsx'
import { HeadingElement } from './heading.tsx'
import { BlockquoteElement } from './blockquote.tsx'
import { RelationshipElement } from './relationship.tsx'
import { tokenSchema } from '@keystar/ui/style'

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
      )
    case 'layout-area':
      return <LayoutArea {...props} />
    case 'code':
      return <CodeElement {...props} />
    case 'component-block': {
      return (
        <ComponentBlocksElement
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      )
    }
    case 'component-inline-prop':
    case 'component-block-prop':
      return <ComponentInlineProp {...props} />
    case 'heading':
      return (
        <HeadingElement
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      )
    case 'link':
      return (
        <LinkElement
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      )
    case 'ordered-list':
      return <ol {...props.attributes}>{props.children}</ol>
    case 'unordered-list':
      return <ul {...props.attributes}>{props.children}</ul>
    case 'list-item':
      return <li {...props.attributes}>{props.children}</li>
    case 'list-item-content':
      return <span {...props.attributes}>{props.children}</span>
    case 'blockquote':
      return <BlockquoteElement {...props} />
    case 'relationship':
      return (
        <RelationshipElement
          attributes={props.attributes}
          children={props.children}
          element={props.element}
        />
      )
    case 'divider':
      return <DividerElement {...props} />
    default:
      return (
        <p style={{ textAlign: props.element.textAlign }} {...props.attributes}>
          {props.children}
        </p>
      )
  }
}

/* Block Elements */

const CodeElement = ({ attributes, children }: RenderElementProps) => {
  return (
    <pre spellCheck="false" {...attributes}>
      <code>{children}</code>
    </pre>
  )
}

function DividerElement({ attributes, children }: RenderElementProps) {
  const selected = useSelected()
  return (
    <div {...attributes} style={{ caretColor: 'transparent' }}>
      <hr
        style={{
          backgroundColor: selected
            ? tokenSchema.color.alias.borderSelected
            : tokenSchema.color.alias.borderIdle,
        }}
      />
      {children}
    </div>
  )
}
