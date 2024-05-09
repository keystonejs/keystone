import {
  type FieldController,
  type FieldControllerConfig,
} from '@keystone-6/core/types'
import {
  type Descendant,
  type Node,
  Editor,
  Text
} from 'slate'

import weakMemoize from '@emotion/weak-memoize'
import { createDocumentEditor } from './DocumentEditor/editor-shared'
import { type ComponentBlock } from './DocumentEditor/component-blocks/api-shared'
import { type Relationships } from './DocumentEditor/relationship-shared'
import { clientSideValidateProp } from './DocumentEditor/component-blocks/utils'
import { isValidURL } from './DocumentEditor/isValidURL'

export type DocumentFeatures = {
  formatting: {
    inlineMarks: {
      bold: boolean
      italic: boolean
      underline: boolean
      strikethrough: boolean
      code: boolean
      superscript: boolean
      subscript: boolean
      keyboard: boolean
    }
    listTypes: {
      ordered: boolean
      unordered: boolean
    }
    alignment: {
      center: boolean
      end: boolean
    }
    headingLevels: (1 | 2 | 3 | 4 | 5 | 6)[]
    blockTypes: {
      blockquote: boolean
      code: boolean
    }
    softBreaks: boolean
  }
  links: boolean
  dividers: boolean
  layouts: [number, ...number[]][]
}

export function controller (
  config: FieldControllerConfig<{
    relationships: Relationships
    documentFeatures: DocumentFeatures
    componentBlocksPassedOnServer: string[]
  }>
): FieldController<Descendant[]> & {
  componentBlocks: Record<string, ComponentBlock>
  relationships: Relationships
  documentFeatures: DocumentFeatures
} {
  const memoizedIsComponentBlockValid = weakMemoize((componentBlock: ComponentBlock) =>
    weakMemoize((props: any) =>
      clientSideValidateProp({ kind: 'object', fields: componentBlock.schema }, props)
    )
  )
  const componentBlocks: Record<string, ComponentBlock> = config.customViews.componentBlocks || {}
  const serverSideComponentBlocksSet = new Set(config.fieldMeta.componentBlocksPassedOnServer)
  const componentBlocksOnlyBeingPassedOnTheClient = Object.keys(componentBlocks).filter(
    x => !serverSideComponentBlocksSet.has(x)
  )
  if (componentBlocksOnlyBeingPassedOnTheClient.length) {
    throw new Error(
      `(${config.listKey}:${
        config.path
      }) The following component blocks are being passed in the custom view but not in the server-side field config: ${JSON.stringify(
        componentBlocksOnlyBeingPassedOnTheClient
      )}`
    )
  }
  const clientSideComponentBlocksSet = new Set(Object.keys(componentBlocks))
  const componentBlocksOnlyBeingPassedOnTheServer =
    config.fieldMeta.componentBlocksPassedOnServer.filter(
      x => !clientSideComponentBlocksSet.has(x)
    )
  if (componentBlocksOnlyBeingPassedOnTheServer.length) {
    throw new Error(
      `(${config.listKey}:${
        config.path
      }) The following component blocks are being passed in the server-side field config but not in the custom view: ${JSON.stringify(
        componentBlocksOnlyBeingPassedOnTheServer
      )}`
    )
  }
  const validateNode = weakMemoize((node: Node): boolean => {
    if (Text.isText(node)) {
      return true
    }
    if (node.type === 'component-block') {
      const componentBlock = componentBlocks[node.component as string]
      if (componentBlock) {
        if (!memoizedIsComponentBlockValid(componentBlock)(node.props)) {
          return false
        }
      }
    }
    if (node.type === 'link' && (typeof node.href !== 'string' || !isValidURL(node.href))) {
      return false
    }
    return node.children.every(node => validateNode(node))
  })
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path} {document(hydrateRelationships: true)}`,
    componentBlocks: config.customViews.componentBlocks || {},
    documentFeatures: config.fieldMeta.documentFeatures,
    relationships: config.fieldMeta.relationships,
    defaultValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    deserialize: data => {
      const documentFromServer = data[config.path]?.document
      if (!documentFromServer) {
        return [{ type: 'paragraph', children: [{ text: '' }] }]
      }
      // make a temporary editor to normalize the document
      const editor = createDocumentEditor(
        config.fieldMeta.documentFeatures,
        componentBlocks,
        config.fieldMeta.relationships
      )
      editor.children = documentFromServer
      Editor.normalize(editor, { force: true })
      return editor.children
    },
    serialize: value => ({
      [config.path]: value,
    }),
    validate (value) {
      return value.every(node => validateNode(node))
    },
  }
}
