import {
  type ComponentSchema,
  type GenericPreviewProps,
  type InitialOrUpdateValueFromComponentPropField,
  type ValueForComponentSchema,
} from './api'
import { getKeysForArrayValue, setKeysForArrayValue } from './preview-props'
import { assertNever } from './utils'

const previewPropsToValueConverter: {
  [Kind in ComponentSchema['kind']]: (
    props: GenericPreviewProps<Extract<ComponentSchema, { kind: Kind }>, unknown>
  ) => ValueForComponentSchema<Extract<ComponentSchema, { kind: Kind }>>;
} = {
  child () {
    return null
  },
  form (props) {
    return props.value
  },
  array (props) {
    const values = props.elements.map(x => previewPropsToValue(x))
    setKeysForArrayValue(
      values,
      props.elements.map(x => x.key)
    )
    return values
  },
  conditional (props) {
    return {
      discriminant: props.discriminant,
      value: previewPropsToValue(props.value),
    }
  },
  object (props) {
    return Object.fromEntries(
      Object.entries(props.fields).map(([key, val]) => [key, previewPropsToValue(val)])
    )
  },
  relationship (props) {
    return props.value
  },
}

export function previewPropsToValue<Schema extends ComponentSchema> (
  props: GenericPreviewProps<ComponentSchema, unknown>
): ValueForComponentSchema<Schema> {
  return (previewPropsToValueConverter[props.schema.kind] as any)(props)
}

const valueToUpdaters: {
  [Kind in ComponentSchema['kind']]: (
    value: ValueForComponentSchema<Extract<ComponentSchema, { kind: Kind }>>,
    schema: Extract<ComponentSchema, { kind: Kind }>
  ) => InitialOrUpdateValueFromComponentPropField<Extract<ComponentSchema, { kind: Kind }>>;
} = {
  child () {
    return undefined
  },
  form (value) {
    return value
  },
  array (value, schema) {
    const keys = getKeysForArrayValue(value)
    return value.map((x, i) => ({
      key: keys[i],
      value: valueToUpdater(x, schema.element),
    }))
  },
  conditional (value, schema) {
    return {
      discriminant: value.discriminant,
      value: valueToUpdater(value.value, schema.values[value.discriminant.toString()]),
    }
  },
  object (value, schema) {
    return Object.fromEntries(
      Object.entries(schema.fields).map(([key, schema]) => [
        key,
        valueToUpdater(value[key], schema),
      ])
    )
  },
  relationship (value) {
    return value
  },
}

function valueToUpdater<Schema extends ComponentSchema> (
  value: ValueForComponentSchema<Schema>,
  schema: ComponentSchema
): InitialOrUpdateValueFromComponentPropField<Schema> {
  return (valueToUpdaters[schema.kind] as any)(value, schema)
}

export function setValueToPreviewProps<Schema extends ComponentSchema> (
  value: ValueForComponentSchema<Schema>,
  props: GenericPreviewProps<ComponentSchema, unknown>
) {
  if (isKind(props, 'child')) {
    // child fields can't be updated through preview props, so we don't do anything here
    return
  }
  if (
    isKind(props, 'form') ||
    isKind(props, 'relationship') ||
    isKind(props, 'object') ||
    isKind(props, 'array')
  ) {
    props.onChange(valueToUpdater(value, props.schema))
    return
  }
  if (isKind(props, 'conditional')) {
    const updater = valueToUpdater(value, props.schema)
    props.onChange(updater.discriminant, updater.value)
    return
  }
  assertNever(props)
}

// this exists because for props.schema.kind === 'form', ts doesn't narrow props, only props.schema
function isKind<Kind extends ComponentSchema['kind']> (
  props: GenericPreviewProps<ComponentSchema, unknown>,
  kind: Kind
): props is GenericPreviewProps<Extract<ComponentSchema, { kind: Kind }>, unknown> {
  return props.schema.kind === kind
}
