import type { ReactElement, ReactNode } from 'react'

export type FormFieldInputProps<Value> = {
  value: Value
  onChange(value: Value): void
  autoFocus: boolean
  /**
   * This will be true when validate has returned false and the user has attempted to close the form
   * or when the form is open and they attempt to save the item
   */
  forceValidation: boolean
}

export type ReadonlyPropPath = readonly (string | number)[]

export type JsonYamlValue =
  | string
  | number
  | boolean
  | null
  | Date
  | readonly JsonYamlValue[]
  | { [key: string]: JsonYamlValue }

type JsonYamlValueWithoutNull = JsonYamlValue & {}

export type FormFieldStoredValue = JsonYamlValueWithoutNull | undefined

export type BasicFormField<
  ParsedValue extends {} | null,
  ValidatedValue extends ParsedValue = ParsedValue,
  ReaderValue = ValidatedValue,
> = {
  kind: 'form'
  formKind?: undefined
  Input(props: FormFieldInputProps<ParsedValue>): ReactElement | null
  defaultValue(): ParsedValue
  parse(value: FormFieldStoredValue): ParsedValue
  /**
   * If undefined is returned, the field will generally not be written,
   * except in array fields where it will be stored as null
   */
  serialize(value: ParsedValue): { value: FormFieldStoredValue }
  validate(value: ParsedValue): ValidatedValue
  reader: {
    parse(value: FormFieldStoredValue): ReaderValue
  }
  label?: string
}

export type RelationshipFormField<
  ParsedValue extends {} | null,
  ValidatedValue extends ParsedValue = ParsedValue,
  ReaderValue = ValidatedValue,
> = {
  kind: 'form'
  formKind: 'relationship'
  Input(props: FormFieldInputProps<ParsedValue>): ReactElement | null
  defaultValue(): ParsedValue
  parse(value: FormFieldStoredValue): ParsedValue
  /**
   * If undefined is returned, the field will generally not be written,
   * except in array fields where it will be stored as null
   */
  serialize(value: ParsedValue): { value: FormFieldStoredValue }
  validate(value: ParsedValue): ValidatedValue
  reader: {
    parse(value: FormFieldStoredValue): ReaderValue
  }
  label?: string
}

export type FormField<
  ParsedValue extends {} | null,
  ValidatedValue extends ParsedValue,
  ReaderValue,
> = BasicFormField<ParsedValue, ValidatedValue, ReaderValue>

export type DocumentNode = DocumentElement | DocumentText

export type DocumentElement = {
  children: DocumentNode[]
  [key: string]: unknown
}

export type DocumentText = {
  text: string
  [key: string]: unknown
}

export type ArrayField<ElementField extends ComponentSchema> = {
  kind: 'array'
  element: ElementField
  label: string
  description?: string
  // this is written with unknown to avoid typescript being annoying about circularity or variance things
  itemLabel?(props: unknown): string
  validation?: {
    length?: {
      min?: number
      max?: number
    }
  }
  Input?(props: unknown): ReactElement | null
}

export type ObjectFieldOptions = {
  label?: string
  description?: string
  /**
   * Define the number of columns each field should span. The grid layout
   * supports 12 possible columns.
   * @example [6, 6] - "one row, equal columns"
   * @example [12, 8, 4] - "one field in the first row, two fields in the second row"
   */
  layout?: number[]
}

export interface ObjectField<
  Fields extends Record<string, ComponentSchema> = Record<string, ComponentSchema>,
> extends ObjectFieldOptions {
  kind: 'object'
  fields: Fields
  Input?(props: unknown): ReactElement | null
}

export type ConditionalField<
  DiscriminantField extends BasicFormField<string | boolean>,
  ConditionalValues extends {
    [Key in `${ReturnType<DiscriminantField['defaultValue']>}`]: ComponentSchema
  },
> = {
  kind: 'conditional'
  discriminant: DiscriminantField
  values: ConditionalValues
  Input?(props: unknown): ReactElement | null
}

// this is written like this rather than ArrayField<ComponentSchema> to avoid TypeScript erroring about circularity
type ArrayFieldInComponentSchema = {
  kind: 'array'
  element: ComponentSchema
  label: string
  description?: string
  // this is written with unknown to avoid typescript being annoying about circularity or variance things
  itemLabel?(props: unknown): string
  validation?: {
    length?: {
      min?: number
      max?: number
    }
  }
  Input?(props: unknown): ReactElement | null
}

export type ComponentSchema =
  | FormField<any, any, any>
  | ObjectField
  | ConditionalField<BasicFormField<any, any, any>, { [key: string]: ComponentSchema }>
  | ArrayFieldInComponentSchema

export * as fields from './fields'

export type ComponentBlock<
  Fields extends Record<string, ComponentSchema> = Record<string, ComponentSchema>,
> = {
  preview: (props: any) => ReactElement | null
  schema: Fields
  label: string
  toolbarIcon?: ReactElement
} & (
  | {
      chromeless: true
      toolbar?: (props: { props: Record<string, any>; onRemove(): void }) => ReactElement
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

type FormFieldPreviewProps<Schema extends FormField<any, any, any>> = {
  readonly value: ReturnType<Schema['defaultValue']>
  onChange(value: ReturnType<Schema['defaultValue']>): void
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

type ConditionalFieldPreviewProps<
  Schema extends ConditionalField<BasicFormField<string | boolean>, any>,
  ChildFieldElement,
> = {
  readonly [Key in keyof Schema['values']]: {
    readonly discriminant: DiscriminantStringToDiscriminantValue<Schema['discriminant'], Key>
    onChange<Discriminant extends ReturnType<Schema['discriminant']['defaultValue']>>(
      discriminant: Discriminant,
      value?: InitialOrUpdateValueFromComponentPropField<Schema['values'][`${Discriminant}`]>
    ): void
    readonly value: GenericPreviewProps<Schema['values'][Key], ChildFieldElement>
    readonly schema: Schema
  }
}[keyof Schema['values']]

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

export type GenericPreviewProps<Schema extends ComponentSchema, ChildFieldElement> =
  Schema extends FormField<any, any, any>
    ? FormFieldPreviewProps<Schema>
    : Schema extends ObjectField<any>
      ? ObjectFieldPreviewProps<Schema, ChildFieldElement>
      : Schema extends ConditionalField<any, any>
        ? ConditionalFieldPreviewProps<Schema, ChildFieldElement>
        : Schema extends ArrayField<any>
          ? ArrayFieldPreviewProps<Schema, ChildFieldElement>
          : never

export type PreviewProps<Schema extends ComponentSchema> = GenericPreviewProps<Schema, ReactNode>

export type InitialOrUpdateValueFromComponentPropField<Schema extends ComponentSchema> =
  Schema extends FormField<infer ParsedValue, any, any>
    ? ParsedValue | undefined
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
        : Schema extends ArrayField<infer ElementField>
          ? readonly {
              key: string | undefined
              value?: InitialOrUpdateValueFromComponentPropField<ElementField>
            }[]
          : never

type DiscriminantStringToDiscriminantValue<
  DiscriminantField extends FormField<any, any, any>,
  DiscriminantString extends PropertyKey,
> =
  ReturnType<DiscriminantField['defaultValue']> extends boolean
    ? 'true' extends DiscriminantString
      ? true
      : 'false' extends DiscriminantString
        ? false
        : never
    : DiscriminantString & string

export type PreviewPropsForToolbar<Schema extends ComponentSchema> = GenericPreviewProps<
  Schema,
  undefined
>

export function component<
  Schema extends {
    [Key in any]: ComponentSchema
  },
>(
  options: {
    /** The preview component shown in the editor */
    preview: (
      props: PreviewProps<ObjectField<Schema>> & { onRemove(): void }
    ) => ReactElement | null
    /** The schema for the props that the preview component, toolbar and rendered component will receive */
    schema: Schema
    /** The label to show in the insert menu and chrome around the block if chromeless is false */
    label: string
    /** An icon to show in the toolbar for this component block. Component blocks with `toolbarIcon` are shown in the toolbar directly instead of the insert menu */
    toolbarIcon?: ReactElement
  } & (
    | {
        chromeless: true
        toolbar?:
          | null
          | ((props: {
              props: PreviewPropsForToolbar<ObjectField<Schema>>
              onRemove(): void
            }) => ReactElement)
      }
    | {
        chromeless?: false
        toolbar?: (props: {
          props: PreviewPropsForToolbar<ObjectField<Schema>>
          onShowEditMode(): void
          onRemove(): void
        }) => ReactElement
      }
  )
): ComponentBlock<Schema> {
  return options as any
}

type Comp<Props> = (props: Props) => ReactElement | null

export type ParsedValueForComponentSchema<Schema extends ComponentSchema> =
  Schema extends FormField<infer Value, any, any>
    ? Value
    : Schema extends ObjectField<infer Value>
      ? {
          readonly [Key in keyof Value]: ParsedValueForComponentSchema<Value[Key]>
        }
      : Schema extends ConditionalField<infer DiscriminantField, infer Values>
        ? {
            readonly [Key in keyof Values]: {
              readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>
              readonly value: ParsedValueForComponentSchema<Values[Key]>
            }
          }[keyof Values]
        : Schema extends ArrayField<infer ElementField>
          ? readonly ParsedValueForComponentSchema<ElementField>[]
          : never

export type ValueForReading<Schema extends ComponentSchema> =
  Schema extends BasicFormField<any, any, infer Value>
    ? Value
    : Schema extends ObjectField<infer Value>
      ? {
          readonly [Key in keyof Value]: ValueForReading<Value[Key]>
        }
      : Schema extends ConditionalField<infer DiscriminantField, infer Values>
        ? {
            readonly [Key in keyof Values]: {
              readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>
              readonly value: ValueForReading<Values[Key]>
            }
          }[keyof Values]
        : Schema extends ArrayField<infer ElementField>
          ? readonly ValueForReading<ElementField>[]
          : never

export type ValueForReadingDeep<Schema extends ComponentSchema> =
  Schema extends FormField<any, any, infer Value>
    ? Value
    : Schema extends ObjectField<infer Value>
      ? {
          readonly [Key in keyof Value]: ValueForReadingDeep<Value[Key]>
        }
      : Schema extends ConditionalField<infer DiscriminantField, infer Values>
        ? {
            readonly [Key in keyof Values]: {
              readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>
              readonly value: ValueForReadingDeep<Values[Key]>
            }
          }[keyof Values]
        : Schema extends ArrayField<infer ElementField>
          ? readonly ValueForReadingDeep<ElementField>[]
          : never

export type InferRenderersForComponentBlocks<
  ComponentBlocks extends Record<string, ComponentBlock<any>>,
> = {
  [Key in keyof ComponentBlocks]: Comp<ValueForReading<ObjectField<ComponentBlocks[Key]['schema']>>>
}
