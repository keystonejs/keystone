import type { RenderElementProps } from 'slate-react'

export function HeadingElement({
  attributes,
  children,
  element,
}: RenderElementProps & { element: { type: 'heading' } }) {
  const Tag = `h${element.level}` as const
  return (
    <Tag {...attributes} style={{ textAlign: element.textAlign }}>
      {children}
    </Tag>
  )
}
