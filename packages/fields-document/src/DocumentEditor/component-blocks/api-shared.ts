import { type graphql } from '@keystone-6/core'
import {
  type ReactElement,
  type ReactNode,
} from 'react'

export type FormFieldValue =
  | string
  | number
  | boolean
  | null
  | readonly FormFieldValue[]
  | { [key: string]: FormFieldValue | undefined }

export type FormField<Value extends FormFieldValue, Options> = {
  kind: 'form'
  Input(props: {
    value: Value
    onChange(value: Value): void
    autoFocus: boolean
    /**
     * This will be true when validate has returned false and the user has attempted to close the form
     * or when the form is open and they attempt to save the item
     */
    forceValidation: boolean
  }): ReactElement | null
  /**
   * The options are config about the field that are available on the
   * preview props when rendering the toolbar and preview component
   */
  options: Options
  defaultValue: Value
  /**
   * validate will be called in two cases:
   * - on the client in the editor when a user is changing the value.
   *   Returning `false` will block closing the form
   *   and saving the item.
   * - on the server when a change is received before allowing it to be saved
   *   if `true` is returned
   * @param value The value of the form field. You should NOT trust
   * this value to be of the correct type because it could come from
   * a potentially malicious client
   */
  validate(value: unknown): boolean
}

export type FormFieldWithGraphQLField<Value extends FormFieldValue, Options> = FormField<
  Value,
  Options
> & {
  graphql: {
    output: graphql.Field<
      { value: Value },
      Record<string, graphql.Arg<graphql.InputType, boolean>>,
      graphql.OutputType,
      'value'
    >
    input: graphql.NullableInputType
  }
}

export type InlineMarksConfig =
  | 'inherit'
  | {
      bold?: 'inherit'
      code?: 'inherit'
      italic?: 'inherit'
      strikethrough?: 'inherit'
      underline?: 'inherit'
      keyboard?: 'inherit'
      subscript?: 'inherit'
      superscript?: 'inherit'
    }

export type BlockFormattingConfig = {
  alignment?: 'inherit'
  blockTypes?: 'inherit'
  headingLevels?: 'inherit' | (1 | 2 | 3 | 4 | 5 | 6)[]
  inlineMarks?: InlineMarksConfig
  listTypes?: 'inherit'
  softBreaks?: 'inherit'
}

export type ChildField = {
  kind: 'child'
  options:
    | {
        kind: 'block'
        placeholder: string
        formatting?: BlockFormattingConfig
        dividers?: 'inherit'
        links?: 'inherit'
        relationships?: 'inherit'
      }
    | {
        kind: 'inline'
        placeholder: string
        formatting?: {
          inlineMarks?: InlineMarksConfig
          softBreaks?: 'inherit'
        }
        links?: 'inherit'
        relationships?: 'inherit'
      }
}

export type ArrayField<ElementField extends ComponentSchema> = {
  kind: 'array'
  element: ElementField
  // this is written with unknown to avoid typescript being annoying about circularity or variance things
  itemLabel?(props: unknown): string
  label?: string
}

export type RelationshipField<Many extends boolean> = {
  kind: 'relationship'
  listKey: string
  selection: string | undefined
  label: string
  many: Many
}

export interface ObjectField<
  Fields extends Record<string, ComponentSchema> = Record<string, ComponentSchema>
> {
  kind: 'object'
  fields: Fields
}

export type ConditionalField<
  DiscriminantField extends FormField<string | boolean, any>,
  ConditionalValues extends {
    [Key in `${DiscriminantField['defaultValue']}`]: ComponentSchema
  }
> = {
  kind: 'conditional'
  discriminant: DiscriminantField
  values: ConditionalValues
}

// this is written like this rather than ArrayField<ComponentSchema> to avoid TypeScript erroring about circularity
type ArrayFieldInComponentSchema = {
  kind: 'array'
  element: ComponentSchema
  // this is written with unknown to avoid typescript being annoying about circularity or variance things
  itemLabel?(props: unknown): string
  label?: string
}

export type ComponentSchema =
  | ChildField
  | FormField<any, any>
  | ObjectField
  | ConditionalField<FormField<any, any>, { [key: string]: ComponentSchema }>
  | RelationshipField<boolean>
  | ArrayFieldInComponentSchema

// this is written like this rather than ArrayField<ComponentSchemaForGraphQL> to avoid TypeScript erroring about circularity
type ArrayFieldInComponentSchemaForGraphQL = {
  kind: 'array'
  element: ComponentSchemaForGraphQL
  // this is written with unknown to avoid typescript being annoying about circularity or variance things
  itemLabel?(props: unknown): string
  label?: string
}

export type ComponentSchemaForGraphQL =
  | FormFieldWithGraphQLField<any, any>
  | ObjectField<Record<string, ComponentSchemaForGraphQL>>
  | ConditionalField<
      FormFieldWithGraphQLField<any, any>,
      { [key: string]: ComponentSchemaForGraphQL }
    >
  | RelationshipField<boolean>
  | ArrayFieldInComponentSchemaForGraphQL

type ChildFieldPreviewProps<Schema extends ChildField, ChildFieldElement> = {
  readonly element: ChildFieldElement
  readonly schema: Schema
}

type FormFieldPreviewProps<Schema extends FormField<any, any>> = {
  readonly value: Schema['defaultValue']
  onChange(value: Schema['defaultValue']): void
  readonly options: Schema['options']
  readonly schema: Schema
}

type ObjectFieldPreviewProps<Schema extends ObjectField<any>, ChildFieldElement> = {
  readonly fields: {
    readonly [Key in keyof Schema['fields']]: GenericPreviewProps<
      Schema['fields'][Key],
      ChildFieldElement
    >
  }
  onChange(value: {
    readonly [Key in keyof Schema['fields']]?: InitialOrUpdateValueFromComponentPropField<
      Schema['fields'][Key]
    >
  }): void
  readonly schema: Schema
}

export type GenericPreviewProps<
  Schema extends ComponentSchema,
  ChildFieldElement
> = Schema extends ChildField
  ? ChildFieldPreviewProps<Schema, ChildFieldElement>
  : Schema extends FormField<infer Value, infer Options>
  ? FormFieldPreviewProps<Schema>
  : Schema extends ObjectField<infer Value>
  ? ObjectFieldPreviewProps<Schema, ChildFieldElement>
  : Schema extends ConditionalField<infer DiscriminantField, infer Values>
  ? ConditionalFieldPreviewProps<Schema, ChildFieldElement>
  : Schema extends RelationshipField<infer Many>
  ? RelationshipFieldPreviewProps<Schema>
  : Schema extends ArrayField<infer ElementField>
  ? ArrayFieldPreviewProps<Schema, ChildFieldElement>
  : never

export type InitialOrUpdateValueFromComponentPropField<Schema extends ComponentSchema> =
  Schema extends ChildField
    ? undefined
    : Schema extends FormField<infer Value, any>
    ? Value | undefined
    : Schema extends ObjectField<infer Value>
    ? {
        readonly [Key in keyof Value]?: InitialOrUpdateValueFromComponentPropField<Value[Key]>
      }
    : Schema extends ConditionalField<infer DiscriminantField, infer Values>
    ? {
        readonly [Key in keyof Values]: {
          readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>
          readonly value?: InitialOrUpdateValueFromComponentPropField<Values[Key]>
        }
      }[keyof Values]
    : Schema extends RelationshipField<infer Many>
    ? Many extends true
      ? readonly HydratedRelationshipData[]
      : HydratedRelationshipData | null
    : Schema extends ArrayField<infer ElementField>
    ? readonly {
        key: string | undefined
        value?: InitialOrUpdateValueFromComponentPropField<ElementField>
      }[]
    : never

type ConditionalFieldPreviewProps<
  Schema extends ConditionalField<FormField<string | boolean, any>, any>,
  ChildFieldElement
> = {
  readonly [Key in keyof Schema['values']]: {
    readonly discriminant: DiscriminantStringToDiscriminantValue<Schema['discriminant'], Key>
    onChange<Discriminant extends Schema['discriminant']['defaultValue']>(
      discriminant: Discriminant,
      value?: InitialOrUpdateValueFromComponentPropField<Schema['values'][`${Discriminant}`]>
    ): void
    readonly options: Schema['discriminant']['options']
    readonly value: GenericPreviewProps<Schema['values'][Key], ChildFieldElement>
    readonly schema: Schema
  }
}[keyof Schema['values']]

// this is a separate type so that this is distributive
type RelationshipDataType<Many extends boolean> = Many extends true
  ? readonly HydratedRelationshipData[]
  : HydratedRelationshipData | null

type RelationshipFieldPreviewProps<Schema extends RelationshipField<boolean>> = {
  readonly value: RelationshipDataType<Schema['many']>
  onChange(relationshipData: RelationshipDataType<Schema['many']>): void
  readonly schema: Schema
}

type ArrayFieldPreviewProps<Schema extends ArrayField<ComponentSchema>, ChildFieldElement> = {
  readonly elements: readonly (GenericPreviewProps<Schema['element'], ChildFieldElement> & {
    readonly key: string
  })[]
  readonly onChange: (
    value: readonly {
      key: string | undefined
      value?: InitialOrUpdateValueFromComponentPropField<Schema['element']>
    }[]
  ) => void
  readonly schema: Schema
}

type DiscriminantStringToDiscriminantValue<
  DiscriminantField extends FormField<any, any>,
  DiscriminantString extends PropertyKey
> = DiscriminantField['defaultValue'] extends boolean
  ? 'true' extends DiscriminantString
    ? true
    : 'false' extends DiscriminantString
    ? false
    : never
  : DiscriminantString

export type HydratedRelationshipData = {
  id: string
  label: string
  data: Record<string, any>
}

export type RelationshipData = {
  id: string
  label?: string
  data?: Record<string, any>
}

type ValueForRenderingFromComponentPropField<Schema extends ComponentSchema> =
  Schema extends ChildField
    ? ReactNode
    : Schema extends FormField<infer Value, any>
    ? Value
    : Schema extends ObjectField<infer Value>
    ? { readonly [Key in keyof Value]: ValueForRenderingFromComponentPropField<Value[Key]> }
    : Schema extends ConditionalField<infer DiscriminantField, infer Values>
    ? {
        readonly [Key in keyof Values]: {
          readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>
          readonly value: ValueForRenderingFromComponentPropField<Values[Key]>
        }
      }[keyof Values]
    : Schema extends RelationshipField<infer Many>
    ? Many extends true
      ? readonly HydratedRelationshipData[]
      : HydratedRelationshipData | null
    : Schema extends ArrayField<infer ElementField>
    ? readonly ValueForRenderingFromComponentPropField<ElementField>[]
    : never

export type ValueForComponentSchema<Schema extends ComponentSchema> = Schema extends ChildField
  ? null
  : Schema extends FormField<infer Value, any>
  ? Value
  : Schema extends ObjectField<infer Value>
  ? { readonly [Key in keyof Value]: ValueForRenderingFromComponentPropField<Value[Key]> }
  : Schema extends ConditionalField<infer DiscriminantField, infer Values>
  ? {
      readonly [Key in keyof Values]: {
        readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>
        readonly value: ValueForRenderingFromComponentPropField<Values[Key]>
      }
    }[keyof Values]
  : Schema extends RelationshipField<infer Many>
  ? Many extends true
    ? readonly HydratedRelationshipData[]
    : HydratedRelationshipData | null
  : Schema extends ArrayField<infer ElementField>
  ? readonly ValueForRenderingFromComponentPropField<ElementField>[]
  : never

type Comp<Props> = (props: Props) => ReactElement | null

type ExtractPropsForPropsForRendering<Props extends Record<string, ComponentSchema>> = {
  readonly [Key in keyof Props]: ValueForRenderingFromComponentPropField<Props[Key]>
}

export type InferRenderersForComponentBlocks<
  ComponentBlocks extends Record<string, ComponentBlock<any>>
> = {
  [Key in keyof ComponentBlocks]: Comp<
    ExtractPropsForPropsForRendering<ComponentBlocks[Key]['schema']>
  >
}

export type ComponentBlock<
  Fields extends Record<string, ComponentSchema> = Record<string, ComponentSchema>
> = {
  preview: (props: any) => ReactElement | null
  schema: Fields
  label: string
} & (
  | {
      chromeless: true
      toolbar?: (props: { props: Record<string, any>, onRemove(): void }) => ReactElement
    }
  | {
      chromeless?: false
      toolbar?: (props: {
        props: Record<string, any>
        onShowEditMode(): void
        onRemove(): void
        isValid: boolean
      }) => ReactElement
    }
)
