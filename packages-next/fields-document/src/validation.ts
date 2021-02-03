import { Text, Editor } from 'slate';
import { createDocumentEditor } from './DocumentEditor';
import { ComponentBlock, ComponentPropField } from './DocumentEditor/component-blocks/api';
import { assertNever } from './DocumentEditor/component-blocks/utils';
import { Relationships } from './DocumentEditor/relationship';
import {
  ElementFromValidation,
  isRelationshipData,
  validateDocumentStructure,
} from './structure-validation';
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
  relationships: Relationships,
  path: (string | number)[]
): any {
  if (prop.kind === 'form') {
    if (prop.validate(value)) {
      return value;
    }
    throw new PropValidationError('Invalid form prop value', path);
  }
  if (prop.kind === 'child') {
    return undefined;
  }
  if (prop.kind === 'relationship') {
    // these two checks will only fail because of things done by the solution developer, not an solution user
    // TODO: move these checks
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

    if (relationship.many) {
      if (Array.isArray(value) && value.every(isRelationshipData)) {
        // yes, ts understands this completely correctly, i'm as suprised as you are
        return value.map(x => ({ id: x.id }));
      } else {
        throw new PropValidationError(`Invalid relationship value`, path);
      }
    }
    if (value === null || isRelationshipData(value)) {
      return value === null ? null : { id: value.id };
    } else {
      throw new PropValidationError(`Invalid relationship value`, path);
    }
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
    // for some reason mongo or mongoose or something is saving undefined as null
    // so we're doing this so that we avoid setting undefined on objects
    const obj: any = {};
    const discriminantVal = validateComponentBlockProps(
      prop.discriminant,
      discriminant,
      relationships,
      path.concat('discriminant')
    );
    if (discriminantVal !== undefined) {
      obj.discriminant = discriminantVal;
    }
    const conditionalFieldValue = validateComponentBlockProps(
      prop.values[discriminant],
      val,
      relationships,
      path.concat('value')
    );
    if (conditionalFieldValue !== undefined) {
      obj.value = conditionalFieldValue;
    }
    return obj;
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
    let val: Record<string, any> = {};
    for (const key of Object.keys(prop.value)) {
      const propVal = validateComponentBlockProps(
        prop.value[key],
        (value as any)[key],
        relationships,
        path.concat(key)
      );
      // for some reason mongo or mongoose or something is saving undefined as null
      // so we're doing this so that we avoid setting undefined on objects
      if (propVal !== undefined) {
        val[key] = propVal;
      }
    }
    return val;
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
      node = {
        ...node,
        props: validateComponentBlockProps(
          { kind: 'object', value: componentBlock.props },
          node.props,
          relationships,
          []
        ),
      };
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
