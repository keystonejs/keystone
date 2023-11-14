import React from 'react'
import { DocumentRenderer, type DocumentRendererProps } from '@keystone-6/document-renderer'

// By default the DocumentRenderer will render unstyled html elements.
// We're customising how headings are rendered here but you can customise
// any of the renderers that the DocumentRenderer uses.
const renderers: DocumentRendererProps['renderers'] = {
  // Render heading blocks
  block: {
    heading ({ level, children, textAlign }) {
      const Comp = `h${level}` as const
      return <Comp style={{ textAlign, textTransform: 'uppercase' }}>{children}</Comp>
    },
  },
}

export function DocumentRender ({ document }: { document: any }) {
  return <DocumentRenderer document={document} renderers={renderers} />
}
