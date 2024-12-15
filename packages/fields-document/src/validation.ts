import {
  Text,
  Editor
} from 'slate'
import {
  type ComponentBlock,
  type ComponentSchema
} from './DocumentEditor/component-blocks/api-shared'
import {
  type ReadonlyPropPath,
  assertNever,
} from './DocumentEditor/component-blocks/utils'
import { createDocumentEditor } from './DocumentEditor/editor-shared'
import { type Relationships } from './DocumentEditor/relationship-shared'
import {
  type ElementFromValidation,
  type TextWithMarks,
  isRelationshipData,
  validateDocumentStructure,
} from './structure-validation'
import { type DocumentFeatures } from './views-shared'

export class PropValidationError extends Error {
  path: ReadonlyPropPath
  constructor (message: string, path: ReadonlyPropPath) {
    super(message)
    this.path = path
  }
}

function validateComponentBlockProps (
  schema: ComponentSchema,
  value: unknown,
  relationships: Relationships,
  path: ReadonlyPropPath
): any {
  if (schema.kind === 'form') {
    if (schema.validate(value)) {
      return value
    }
    throw new PropValidationError('Invalid form prop value', path)
  }
  if (schema.kind === 'child') {
    return null
  }
  if (schema.kind === 'relationship') {
    if (schema.many) {
      if (Array.isArray(value) && value.every(isRelationshipData)) {
        // yes, ts understands this completely correctly, i'm as suprised as you are
        return value.map(x => ({ id: x.id }))
      } else {
        throw new PropValidationError(`Invalid relationship value`, path)
      }
    }
    if (value === null || isRelationshipData(value)) {
      return value === null ? null : { id: value.id }
    } else {
      throw new PropValidationError(`Invalid relationship value`, path)
    }
  }

  if (schema.kind === 'conditional') {
    if (typeof value !== 'object' || value === null) {
      throw new PropValidationError('Conditional value must be an object', path)
    }
    for (const key of Object.keys(value)) {
      if (key !== 'discriminant' && key !== 'value') {
        throw new PropValidationError(
          `Conditional value only allows keys named "discriminant" and "value", not "${key}"`,
          path
        )
      }
    }
    const discriminant = (value as any).discriminant
    const val = (value as any).value
    // for some reason mongo or mongoose or something is saving undefined as null
    // so we're doing this so that we avoid setting undefined on objects
    const obj: any = {}
    const discriminantVal = validateComponentBlockProps(
      schema.discriminant,
      discriminant,
      relationships,
      path.concat('discriminant')
    )
    if (discriminantVal !== undefined) {
      obj.discriminant = discriminantVal
    }
    const conditionalFieldValue = validateComponentBlockProps(
      schema.values[discriminant],
      val,
      relationships,
      path.concat('value')
    )
    if (conditionalFieldValue !== undefined) {
      obj.value = conditionalFieldValue
    }
    return obj
  }

  if (schema.kind === 'object') {
    if (typeof value !== 'object' || value === null) {
      throw new PropValidationError('Object value must be an object', path)
    }
    const allowedKeysSet = new Set(Object.keys(schema.fields))
    for (const key of Object.keys(value)) {
      if (!allowedKeysSet.has(key)) {
        throw new PropValidationError(`Key on object value "${key}" is not allowed`, path)
      }
    }
    const val: Record<string, any> = {}
    for (const key of Object.keys(schema.fields)) {
      const propVal = validateComponentBlockProps(
        schema.fields[key],
        (value as any)[key],
        relationships,
        path.concat(key)
      )
      // for some reason mongo or mongoose or something is saving undefined as null
      // so we're doing this so that we avoid setting undefined on objects
      if (propVal !== undefined) {
        val[key] = propVal
      }
    }
    return val
  }
  if (schema.kind === 'array') {
    if (!Array.isArray(value)) {
      throw new PropValidationError('Array field value must be an array', path)
    }
    return value.map((innerVal, i) => {
      return validateComponentBlockProps(schema.element, innerVal, relationships, path.concat(i))
    })
  }
  assertNever(schema)
}

function isText (node: ElementFromValidation): node is TextWithMarks {
  return Text.isText(node)
}

// note that the errors thrown from here will only be exposed
// as internal server error from the graphql api in prod
// this is fine because these cases are pretty much all about
// malicious content being inserted, not valid content
export function getValidatedNodeWithNormalizedComponentFormProps (
  node: ElementFromValidation,
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships
): ElementFromValidation {
  if (isText(node)) return node
  if (node.type === 'component-block') {
    if (Object.prototype.hasOwnProperty.call(componentBlocks, node.component)) {
      const componentBlock = componentBlocks[node.component]
      node = {
        ...node,
        props: validateComponentBlockProps(
          { kind: 'object', fields: componentBlock.schema },
          node.props,
          relationships,
          []
        ),
      }
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
    }
  }

  return {
    ...node,
    children: node.children.map(x =>
      getValidatedNodeWithNormalizedComponentFormProps(x, componentBlocks, relationships)
    ),
  }
}

export function validateAndNormalizeDocument (
  value: unknown,
  documentFeatures: DocumentFeatures,
  componentBlocks: Record<string, ComponentBlock>,
  relationships: Relationships
) {
  validateDocumentStructure(value)
  const children = value.map(x => getValidatedNodeWithNormalizedComponentFormProps(x, componentBlocks, relationships))
  const editor = createDocumentEditor(documentFeatures, componentBlocks, relationships)
  editor.children = children
  Editor.normalize(editor, { force: true })
  return editor.children
}
