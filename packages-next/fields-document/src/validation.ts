import { Text, Editor } from 'slate';
import { createDocumentEditor } from './DocumentEditor';
import { ComponentBlock, ComponentPropField } from './DocumentEditor/component-blocks/api';
import { assertNever, RelationshipValues } from './DocumentEditor/component-blocks/utils';
import { Relationships } from './DocumentEditor/relationship';
import { ElementFromValidation, validateDocumentStructure } from './structure-validation';
import { DocumentFeatures } from './views';

export class PropValidationError extends Error {
  path: (string | number)[];
  constructor(message: string, path: (string | number)[]) {
    super(message);
    this.path = path;
  }
}

function validateComponentBlockProps(
  prop: ComponentPropField,
  value: unknown,
  inputRelationshipValues: RelationshipValues,
  outputRelationshipValues: RelationshipValues,
  relationships: Relationships,
  path: (string | number)[]
) {
  if (prop.kind === 'form') {
    if (prop.validate(value)) {
      return;
    }
    throw new PropValidationError('Invalid form prop value', path);
  }
  if (prop.kind === 'child') {
    return;
  }
  if (prop.kind === 'relationship') {
    const stringifiedPath = JSON.stringify(path);
    const relationshipVal = inputRelationshipValues[stringifiedPath];
    if (!relationshipVal) {
      throw new PropValidationError('Missing relationship value', path);
    }
    if (relationshipVal.relationship !== prop.relationship) {
      throw new PropValidationError(
        `Incorrect relationship "${relationshipVal.relationship}" specified where it should be "${prop.relationship}"`,
        path
      );
    }
    const relationship = relationships[prop.relationship];
    if (!relationship) {
      throw new PropValidationError(
        `Relationship prop specifies the relationship "${prop.relationship}" but it is not an allowed relationship`,
        path
      );
    }
    if (relationship.kind !== 'prop') {
      throw new PropValidationError(
        `Unexpected relationship "${prop.relationship}" of kind "${relationship.kind}" where the kind should be "prop"`,
        path
      );
    }

    const isArray = Array.isArray(relationshipVal.data);

    if (!isArray && relationship.many) {
      throw new PropValidationError('Many relationship value must be an array', path);
    }
    if (isArray && !relationship.many) {
      throw new PropValidationError('One relationship value must be a relation or null', path);
    }
    outputRelationshipValues[stringifiedPath] = {
      data: isArray
        ? (relationshipVal.data as any).map((x: any) => ({ id: x.id }))
        : (relationshipVal.data as any)?.id !== undefined
        ? { id: (relationshipVal.data as any).id }
        : null,
      relationship: prop.relationship,
    };
    return;
  }

  if (prop.kind === 'conditional') {
    if (typeof value !== 'object' || value === null) {
      throw new PropValidationError('Conditional value must be an object', path);
    }
    for (const key of Object.keys(value)) {
      if (key !== 'discriminant' && key !== 'value') {
        throw new PropValidationError(
          `Conditional value only allows keys named "discriminant" and "value", not "${key}"`,
          path
        );
      }
    }
    const discriminant = (value as any).discriminant;
    const val = (value as any).value;

    validateComponentBlockProps(
      prop.discriminant,
      discriminant,
      inputRelationshipValues,
      outputRelationshipValues,
      relationships,
      path.concat('discriminant')
    );
    validateComponentBlockProps(
      prop.values[discriminant],
      val,
      inputRelationshipValues,
      outputRelationshipValues,
      relationships,
      path.concat('value')
    );
    return;
  }

  if (prop.kind === 'object') {
    if (typeof value !== 'object' || value === null) {
      throw new PropValidationError('Object value must be an object', path);
    }
    const allowedKeysSet = new Set(Object.keys(prop.value));
    for (const key of Object.keys(value)) {
      if (!allowedKeysSet.has(key)) {
        throw new PropValidationError(`Key on object value "${key}" is not allowed`, path);
      }
    }
    for (const key of Object.keys(prop.value)) {
      validateComponentBlockProps(
        prop.value[key],
        (value as any)[key],
        inputRelationshipValues,
        outputRelationshipValues,
        relationships,
        path.concat(key)
      );
    }
    return;
  }
  assertNever(prop);
}

// note that the errors thrown from here will only be exposed
// as internal server error from the graphql api in prod
// this is fine because these cases are pretty much all about
// malicious content being inserted, not valid content
export function getValidatedNodeWithNormalizedComponentFormProps(
  node: ElementFromValidation,
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships
): ElementFromValidation {
  if (Text.isText(node)) {
    return node;
  }
  if (node.type === 'component-block') {
    if (componentBlocks.hasOwnProperty(node.component)) {
      const componentBlock = componentBlocks[node.component];
      const outputRelationshipValues = {};
      validateComponentBlockProps(
        { kind: 'object', value: componentBlock.props },
        node.props,
        node.relationships,
        outputRelationshipValues,
        relationships,
        []
      );
      if (Object.keys(outputRelationshipValues).length !== Object.keys(node.relationships).length) {
        throw new Error('Mismatched relationship count on component block');
      }
      node = { ...node, relationships: outputRelationshipValues };
    }
  }

  if (node.type === 'relationship') {
    node = {
      type: 'relationship',
      data:
        node.data?.id !== undefined
          ? { id: node.data.id, data: undefined, label: undefined }
          : null,
      relationship: node.relationship,
      children: node.children,
    };
  }
  return {
    ...node,
    children: (node.children as any).map((x: ElementFromValidation) =>
      getValidatedNodeWithNormalizedComponentFormProps(x, componentBlocks, relationships)
    ),
  };
}

export function validateAndNormalizeDocument(
  value: unknown,
  documentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships
) {
  validateDocumentStructure(value);
  const children = value.map(x =>
    getValidatedNodeWithNormalizedComponentFormProps(x, componentBlocks, relationships)
  );
  const editor = createDocumentEditor(documentFeatures, componentBlocks, relationships, {
    current: false,
  });
  editor.children = children;
  Editor.normalize(editor, { force: true });
  return editor.children;
}
