import React, { type ReactNode, useContext } from 'react'
import { useSlate } from 'slate-react'
import { type DocumentFeatures } from '../views'
import { ComponentBlockContext } from './component-blocks'
import { type ComponentBlock } from './component-blocks/api'
import { LayoutOptionsProvider } from './layouts'
import { DocumentFieldRelationshipsProvider, type Relationships } from './relationship'

import {
  type ToolbarState,
  createToolbarState
} from './toolbar-state-shared'

const ToolbarStateContext = React.createContext<null | ToolbarState>(null)

export function useToolbarState () {
  const toolbarState = useContext(ToolbarStateContext)
  if (!toolbarState) {
    throw new Error('ToolbarStateProvider must be used to use useToolbarState')
  }
  return toolbarState
}

export const ToolbarStateProvider = ({
  children,
  componentBlocks,
  editorDocumentFeatures,
  relationships,
}: {
  children: ReactNode
  componentBlocks: Record<string, ComponentBlock>
  editorDocumentFeatures: DocumentFeatures
  relationships: Relationships
}) => {
  const editor = useSlate()

  return (
    <DocumentFieldRelationshipsProvider value={relationships}>
      <LayoutOptionsProvider value={editorDocumentFeatures.layouts}>
        <ComponentBlockContext.Provider value={componentBlocks}>
          <ToolbarStateContext.Provider
            value={createToolbarState(editor, componentBlocks, editorDocumentFeatures)}
          >
            {children}
          </ToolbarStateContext.Provider>
        </ComponentBlockContext.Provider>
      </LayoutOptionsProvider>
    </DocumentFieldRelationshipsProvider>
  )
}
