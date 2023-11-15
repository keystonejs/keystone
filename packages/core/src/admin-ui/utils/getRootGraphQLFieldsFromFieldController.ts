import weakMemoize from '@emotion/weak-memoize'
import { type FragmentDefinitionNode, parse, type SelectionSetNode } from 'graphql'
import type { FieldController } from '../../types'

function extractRootFields (selectedFields: Set<string>, selectionSet: SelectionSetNode) {
  selectionSet.selections.forEach(selection => {
    if (selection.kind === 'Field') {
      selectedFields.add(selection.alias ? selection.alias.value : selection.name.value)
    }
    if (selection.kind === 'InlineFragment') {
      extractRootFields(selectedFields, selection.selectionSet)
    }
    // FragmentSpread will never happen for the use cases of getRootFieldsFromSelection
  })
}

export const getRootGraphQLFieldsFromFieldController = weakMemoize(
  (controller: FieldController<any, any>) => {
    const ast = parse(`fragment X on Y {
  id
  ${controller.graphqlSelection}
  }`)
    const selectedFields = new Set<string>()
    const fragmentNode = ast.definitions[0] as FragmentDefinitionNode
    extractRootFields(selectedFields, fragmentNode.selectionSet)
    return [...selectedFields]
  }
)
