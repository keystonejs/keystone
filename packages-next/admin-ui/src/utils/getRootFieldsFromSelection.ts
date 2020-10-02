import { FragmentDefinitionNode, parse, SelectionSetNode } from 'graphql';

function extractRootFields(selectedFields: Set<string>, selectionSet: SelectionSetNode) {
  selectionSet.selections.forEach(selection => {
    if (selection.kind === 'Field') {
      selectedFields.add(selection.name.value);
    }
    if (selection.kind === 'InlineFragment') {
      extractRootFields(selectedFields, selection.selectionSet);
    }
    // FragmentSpread will never happen for the use cases of getRootFieldsFromSelection
  });
}

export function getRootFieldsFromSelection(selection: string) {
  const ast = parse(`fragment X on Y {
  someFieldBecauseGraphQLRequiresAtLeastOneSelection
  ${selection}
  }`);
  const selectedFields = new Set<string>();
  const fragmentNode = ast.definitions[0] as FragmentDefinitionNode;
  extractRootFields(selectedFields, fragmentNode.selectionSet);
  selectedFields.delete('someFieldBecauseGraphQLRequiresAtLeastOneSelection');
  return [...selectedFields];
}
