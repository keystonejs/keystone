import type { FieldController, FieldControllerConfig } from '@keystone-6/core/types'
import type { ContentComponent } from './content-components'
import type { EditorState } from 'prosemirror-state'
import { createEditorState } from './editor/editor-state'
import { createEditorSchema } from './editor/schema'
import type { EditorConfig } from './config'

export function controller(
  config: FieldControllerConfig<{
    // relationships: Relationships
    config: EditorConfig
  }>
): FieldController<EditorState> & {
  components: Record<string, ContentComponent>
  // relationships: Relationships
} {
  // const memoizedIsComponentBlockValid = weakMemoize((componentBlock: ContentComponent) =>
  //   weakMemoize((props: any) =>
  //     clientSideValidateProp({ kind: 'object', fields: componentBlock.schema }, props, undefined)
  //   )
  // )
  const components: Record<string, ContentComponent> = config.customViews.components || {}
  // const validateNode = weakMemoize((node: Node): boolean => {
  //   if (Text.isText(node)) {
  //     return true
  //   }
  //   if (node.type === 'component-block') {
  //     const componentBlock = componentBlocks[node.component as string]
  //     if (componentBlock) {
  //       if (!memoizedIsComponentBlockValid(componentBlock)(node.props)) {
  //         return false
  //       }
  //     }
  //   }
  //   if (node.type === 'link' && typeof node.href !== 'string') {
  //     return false
  //   }
  //   return node.children.every(node => validateNode(node))
  // })

  const schema = createEditorSchema(config.fieldMeta.config, components)
  return {
    fieldKey: config.fieldKey,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.fieldKey} {content}`,
    components,
    // relationships: config.fieldMeta.relationships,
    defaultValue: createEditorState(schema.nodes.doc.createAndFill()!),
    deserialize: data => {
      const documentFromServer = data[config.fieldKey]?.content
      if (!documentFromServer) {
        return createEditorState(schema.nodes.doc.createAndFill()!)
      }
      return createEditorState(schema.schema.nodeFromJSON(documentFromServer))
    },
    serialize: value => ({
      [config.fieldKey]: JSON.parse(JSON.stringify(value.doc.toJSON())),
    }),
    validate() {
      return true
      // return state.doc.toJSON().every(node => validateNode(node))
    },
  }
}
