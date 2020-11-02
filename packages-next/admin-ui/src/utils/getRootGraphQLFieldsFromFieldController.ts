import { FieldController } from '@keystone-next/types';
import weakMemoize from '@emotion/weak-memoize';
import { FragmentDefinitionNode, parse, SelectionSetNode } from 'graphql';

function extractRootFields(selectedFields: Set<string>, selectionSet: SelectionSetNode) {
  selectionSet.selections.forEach(selection => {
    if (
      selection.kind === 'Field' &&
      selection.name.value !== 'someFieldBecauseGraphQLRequiresAtLeastOneSelection'
    ) {
      selectedFields.add(selection.name.value);
    }
    if (selection.kind === 'InlineFragment') {
      extractRootFields(selectedFields, selection.selectionSet);
    }
    // FragmentSpread will never happen for the use cases of getRootFieldsFromSelection
  });
}

export const getRootGraphQLFieldsFromFieldController = weakMemoize(
  (controller: FieldController<any, any>) => {
    const ast = parse(`fragment X on Y {
  someFieldBecauseGraphQLRequiresAtLeastOneSelection
  ${controller.graphqlSelection}
  }`);
    const selectedFields = new Set<string>();
    const fragmentNode = ast.definitions[0] as FragmentDefinitionNode;
    extractRootFields(selectedFields, fragmentNode.selectionSet);
    return [...selectedFields];
  }
);
