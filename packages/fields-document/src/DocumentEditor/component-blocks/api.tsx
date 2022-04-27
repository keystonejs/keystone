/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import {
  FieldContainer,
  FieldLabel,
  Select,
  TextInput,
  Checkbox,
  MultiSelect,
} from '@keystone-ui/fields';
import { HTMLAttributes, ReactElement, ReactNode, useState } from 'react';
import { isValidURL } from '../isValidURL';

export type FormFieldValue =
  | string
  | number
  | boolean
  | null
  | readonly FormFieldValue[]
  | { [key: string]: FormFieldValue | undefined };

export type FormField<Value extends FormFieldValue, Options> = {
  kind: 'form';
  Input(props: {
    value: Value;
    onChange(value: Value): void;
    autoFocus: boolean;
    /**
     * This will be true when validate has returned false and the user has attempted to close the form
     * or when the form is open and they attempt to save the item
     */
    forceValidation: boolean;
  }): ReactElement | null;
  /**
   * The options are config about the field that are available on the
   * preview props when rendering the toolbar and preview component
   */
  options: Options;
  defaultValue: Value;
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
  validate(value: unknown): boolean;
};

type InlineMarksConfig =
  | 'inherit'
  | {
      bold?: 'inherit';
      code?: 'inherit';
      italic?: 'inherit';
      strikethrough?: 'inherit';
      underline?: 'inherit';
      keyboard?: 'inherit';
      subscript?: 'inherit';
      superscript?: 'inherit';
    };

type BlockFormattingConfig = {
  alignment?: 'inherit';
  blockTypes?: 'inherit';
  headingLevels?: 'inherit' | (1 | 2 | 3 | 4 | 5 | 6)[];
  inlineMarks?: InlineMarksConfig;
  listTypes?: 'inherit';
  softBreaks?: 'inherit';
};

export type ChildField = {
  kind: 'child';
  options:
    | {
        kind: 'block';
        placeholder: string;
        formatting?: BlockFormattingConfig;
        dividers?: 'inherit';
        links?: 'inherit';
        relationships?: 'inherit';
      }
    | {
        kind: 'inline';
        placeholder: string;
        formatting?: {
          inlineMarks?: InlineMarksConfig;
          softBreaks?: 'inherit';
        };
        links?: 'inherit';
        relationships?: 'inherit';
      };
};

export type ArrayField<ElementField extends ComponentSchema> = {
  kind: 'array';
  element: ElementField;
};

export type RelationshipField<Many extends boolean> = {
  kind: 'relationship';
  listKey: string;
  selection: string | undefined;
  label: string;
  many: Many;
};

export interface ObjectField<
  fields extends Record<string, ComponentSchema> = Record<string, ComponentSchema>
> {
  kind: 'object';
  fields: fields;
}

export type ConditionalField<
  DiscriminantField extends FormField<string | boolean, any>,
  ConditionalValues extends {
    [Key in `${DiscriminantField['defaultValue']}`]: ComponentSchema;
  }
> = {
  kind: 'conditional';
  discriminant: DiscriminantField;
  values: ConditionalValues;
};

export type ComponentSchema =
  | ChildField
  | FormField<any, any>
  | ObjectField
  | ConditionalField<FormField<any, any>, { [key: string]: ComponentSchema }>
  | RelationshipField<boolean>
  // this is written like this rather than ArrayField<ComponentSchema> to avoid TypeScript erroring about circularity
  | { kind: 'array'; element: ComponentSchema };

export const fields = {
  text({
    label,
    defaultValue = '',
  }: {
    label: string;
    defaultValue?: string;
  }): FormField<string, undefined> {
    return {
      kind: 'form',
      Input({ value, onChange, autoFocus }) {
        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <TextInput
              autoFocus={autoFocus}
              value={value}
              onChange={event => {
                onChange(event.target.value);
              }}
            />
          </FieldContainer>
        );
      },
      options: undefined,
      defaultValue,
      validate(value) {
        return typeof value === 'string';
      },
    };
  },
  url({
    label,
    defaultValue = '',
  }: {
    label: string;
    defaultValue?: string;
  }): FormField<string, undefined> {
    const validate = (value: unknown) => {
      return typeof value === 'string' && (value === '' || isValidURL(value));
    };
    return {
      kind: 'form',
      Input({ value, onChange, autoFocus, forceValidation }) {
        const [blurred, setBlurred] = useState(false);
        const showValidation = forceValidation || (blurred && !validate(value));
        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <TextInput
              onBlur={() => {
                setBlurred(true);
              }}
              autoFocus={autoFocus}
              value={value}
              onChange={event => {
                onChange(event.target.value);
              }}
            />
            {showValidation && <span css={{ color: 'red' }}>Please provide a valid URL</span>}
          </FieldContainer>
        );
      },
      options: undefined,
      defaultValue,
      validate,
    };
  },
  select<Option extends { label: string; value: string }>({
    label,
    options,
    defaultValue,
  }: {
    label: string;
    options: readonly Option[];
    defaultValue: Option['value'];
  }): FormField<Option['value'], readonly Option[]> {
    const optionValuesSet = new Set(options.map(x => x.value));
    if (!optionValuesSet.has(defaultValue)) {
      throw new Error(
        `A defaultValue of ${defaultValue} was provided to a select field but it does not match the value of one of the options provided`
      );
    }
    return {
      kind: 'form',
      Input({ value, onChange, autoFocus }) {
        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <Select
              autoFocus={autoFocus}
              value={options.find(option => option.value === value) || null}
              onChange={option => {
                if (option) {
                  onChange(option.value);
                }
              }}
              options={options}
            />
          </FieldContainer>
        );
      },
      options,
      defaultValue,
      validate(value) {
        return typeof value === 'string' && optionValuesSet.has(value);
      },
    };
  },
  multiselect<Option extends { label: string; value: string }>({
    label,
    options,
    defaultValue,
  }: {
    label: string;
    options: readonly Option[];
    defaultValue: readonly Option['value'][];
  }): FormField<readonly Option['value'][], readonly Option[]> {
    const valuesToOption = new Map(options.map(x => [x.value, x]));
    return {
      kind: 'form',
      Input({ value, onChange, autoFocus }) {
        return (
          <FieldContainer>
            <FieldLabel>{label}</FieldLabel>
            <MultiSelect
              autoFocus={autoFocus}
              value={value.map(x => valuesToOption.get(x)!)}
              options={options}
              onChange={options => {
                onChange(options.map(x => x.value));
              }}
            />
          </FieldContainer>
        );
      },
      options,
      defaultValue,
      validate(value) {
        return (
          Array.isArray(value) &&
          value.every(value => typeof value === 'string' && valuesToOption.has(value))
        );
      },
    };
  },
  checkbox({
    label,
    defaultValue = false,
  }: {
    label: string;
    defaultValue?: boolean;
  }): FormField<boolean, undefined> {
    return {
      kind: 'form',
      Input({ value, onChange, autoFocus }) {
        return (
          <FieldContainer>
            <Checkbox
              checked={value}
              autoFocus={autoFocus}
              onChange={event => {
                onChange(event.target.checked);
              }}
            >
              {label}
            </Checkbox>
          </FieldContainer>
        );
      },
      options: undefined,
      defaultValue,
      validate(value) {
        return typeof value === 'boolean';
      },
    };
  },
  empty(): FormField<null, undefined> {
    return {
      kind: 'form',
      Input() {
        return null;
      },
      options: undefined,
      defaultValue: null,
      validate(value) {
        return value === null || value === undefined;
      },
    };
  },
  child(
    options:
      | {
          kind: 'block';
          placeholder: string;
          formatting?: BlockFormattingConfig | 'inherit';
          dividers?: 'inherit';
          links?: 'inherit';
          relationships?: 'inherit';
        }
      | {
          kind: 'inline';
          placeholder: string;
          formatting?:
            | 'inherit'
            | {
                inlineMarks?: InlineMarksConfig;
                softBreaks?: 'inherit';
              };
          links?: 'inherit';
          relationships?: 'inherit';
        }
  ): ChildField {
    return {
      kind: 'child',
      options:
        options.kind === 'block'
          ? {
              kind: 'block',
              placeholder: options.placeholder,
              dividers: options.dividers,
              formatting:
                options.formatting === 'inherit'
                  ? {
                      blockTypes: 'inherit',
                      headingLevels: 'inherit',
                      inlineMarks: 'inherit',
                      listTypes: 'inherit',
                      alignment: 'inherit',
                      softBreaks: 'inherit',
                    }
                  : options.formatting,
              links: options.links,
              relationships: options.relationships,
            }
          : {
              kind: 'inline',
              placeholder: options.placeholder,
              formatting:
                options.formatting === 'inherit'
                  ? { inlineMarks: 'inherit', softBreaks: 'inherit' }
                  : options.formatting,
              links: options.links,
              relationships: options.relationships,
            },
    };
  },
  object<Fields extends Record<string, ComponentSchema>>(fields: Fields): ObjectField<Fields> {
    return { kind: 'object', fields };
  },
  conditional<
    DiscriminantField extends FormField<string | boolean, any>,
    ConditionalValues extends {
      [Key in `${DiscriminantField['defaultValue']}`]: ComponentSchema;
    }
  >(
    discriminant: DiscriminantField,
    values: ConditionalValues
  ): ConditionalField<DiscriminantField, ConditionalValues> {
    if (
      (discriminant.validate('true') || discriminant.validate('false')) &&
      (discriminant.validate(true) || discriminant.validate(false))
    ) {
      throw new Error(
        'The discriminant of a conditional field must not allow both strings and booleans to be valid values. only strings or only booleans can be valid'
      );
    }
    return {
      kind: 'conditional',
      discriminant,
      values: values,
    };
  },
  relationship<Many extends boolean | undefined = false>({
    listKey,
    selection,
    label,
    many,
  }: {
    listKey: string;
    label: string;
    selection?: string;
  } & (Many extends undefined | false ? { many?: Many } : { many: Many })): RelationshipField<
    Many extends true ? true : false
  > {
    return {
      kind: 'relationship',
      listKey,
      selection,
      label,
      many: (many ? true : false) as any,
    };
  },
  array<ElementField extends ComponentSchema>(element: ElementField): ArrayField<ElementField> {
    return { kind: 'array', element };
  },
};

export type ComponentBlock<
  Fields extends Record<string, ComponentSchema> = Record<string, ComponentSchema>
> = {
  preview: (props: any) => ReactElement | null;
  schema: Fields;
  label: string;
} & (
  | {
      chromeless: true;
      toolbar?: (props: { props: Record<string, any>; onRemove(): void }) => ReactElement;
    }
  | {
      chromeless?: false;
      toolbar?: (props: {
        props: Record<string, any>;
        onShowEditMode(): void;
        onRemove(): void;
        isValid: boolean;
      }) => ReactElement;
    }
);

type GenericPreviewProps<Prop extends ComponentSchema, ChildFieldType> = Prop extends ChildField
  ? {
      readonly element: ChildFieldType;
      readonly schema: Prop;
    }
  : Prop extends FormField<infer Value, infer Options>
  ? {
      readonly value: Value;
      onChange(value: Value): void;
      readonly options: Options;
      readonly schema: Prop;
    }
  : Prop extends ObjectField<infer Value>
  ? {
      readonly fields: {
        readonly [Key in keyof Value]: GenericPreviewProps<Value[Key], ChildFieldType>;
      };
      onChange(value: {
        readonly [Key in keyof Value]?: InitialOrUpdateValueFromComponentPropField<Value[Key]>;
      }): void;
      readonly schema: Prop;
    }
  : Prop extends ConditionalField<infer DiscriminantField, infer Values>
  ? {
      readonly [Key in keyof Values]: {
        readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>;
        onChange<Discriminant extends DiscriminantField['defaultValue']>(
          discriminant: Discriminant,
          value?: InitialOrUpdateValueFromComponentPropField<
            GetFromKey<Values, DiscrimiantToString<Discriminant>>
          >
        ): void;
        readonly options: DiscriminantField['options'];
        readonly value: GenericPreviewProps<Values[Key], ChildFieldType>;
        readonly schema: Prop;
      };
    }[keyof Values]
  : Prop extends RelationshipField<infer Many>
  ? {
      readonly value: Many extends true
        ? readonly HydratedRelationshipData[]
        : HydratedRelationshipData | null;
      onChange(
        relationshipData: Many extends true
          ? readonly HydratedRelationshipData[]
          : HydratedRelationshipData | null
      ): void;
      readonly schema: Prop;
    }
  : Prop extends ArrayField<infer ElementField>
  ? {
      readonly elements: readonly (GenericPreviewProps<ElementField, ChildFieldType> & {
        readonly key: string;
      })[];
      readonly onChange: (
        value: readonly {
          key: string | undefined;
          value?: InitialOrUpdateValueFromComponentPropField<ElementField>;
        }[]
      ) => void;
      readonly schema: Prop;
    }
  : never;

export type PreviewProps<Prop extends ComponentSchema> = GenericPreviewProps<Prop, ReactNode>;

type GetFromKey<Obj, Key> = Key extends keyof Obj ? Obj[Key] : never;

type DiscrimiantToString<Discriminant extends string | boolean> = Discriminant extends true
  ? 'true'
  : Discriminant extends false
  ? 'false'
  : Discriminant;

export type InitialOrUpdateValueFromComponentPropField<Prop extends ComponentSchema> =
  Prop extends ChildField
    ? undefined
    : Prop extends FormField<infer Value, any>
    ? Value | undefined
    : Prop extends ObjectField<infer Value>
    ? {
        readonly [Key in keyof Value]?: InitialOrUpdateValueFromComponentPropField<Value[Key]>;
      }
    : Prop extends ConditionalField<infer DiscriminantField, infer Values>
    ? {
        readonly [Key in keyof Values]: {
          readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>;
          readonly value?: InitialOrUpdateValueFromComponentPropField<Values[Key]>;
        };
      }[keyof Values]
    : Prop extends RelationshipField<infer Many>
    ? Many extends true
      ? readonly HydratedRelationshipData[]
      : HydratedRelationshipData | null
    : Prop extends ArrayField<infer ElementField>
    ? readonly {
        key: string | undefined;
        value?: InitialOrUpdateValueFromComponentPropField<ElementField>;
      }[]
    : never;

type DiscriminantStringToDiscriminantValue<
  DiscriminantField extends FormField<any, any>,
  DiscriminantString extends PropertyKey
> = DiscriminantField['defaultValue'] extends boolean
  ? 'true' extends DiscriminantString
    ? true
    : 'false' extends DiscriminantString
    ? false
    : never
  : DiscriminantString;

export type PreviewPropsForToolbar<Prop extends ComponentSchema> = GenericPreviewProps<
  Prop,
  undefined
>;

export type HydratedRelationshipData = {
  id: string;
  label: string;
  data: Record<string, any>;
};

export type RelationshipData = {
  id: string;
  label: string | undefined;
  data: Record<string, any> | undefined;
};

export function component<
  Schema extends {
    [Key in any]: ComponentSchema;
  }
>(
  options: {
    /** The preview component shown in the editor */
    preview: (props: PreviewProps<ObjectField<Schema>>) => ReactElement | null;
    /** The schema for the props that the preview component, toolbar and rendered component will receive */
    schema: Schema;
    /** The label to show in the insert menu and chrome around the block if chromeless is false */
    label: string;
  } & (
    | {
        chromeless: true;
        toolbar?: (props: {
          props: {
            [Key in keyof Schema]: PreviewPropsForToolbar<Schema[Key]>;
          };
          onRemove(): void;
        }) => ReactElement;
      }
    | {
        chromeless?: false;
        toolbar?: (props: {
          props: {
            [Key in keyof Schema]: PreviewPropsForToolbar<Schema[Key]>;
          };
          onShowEditMode(): void;
          onRemove(): void;
        }) => ReactElement;
      }
  )
): ComponentBlock<Schema> {
  return options as any;
}

export const NotEditable = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <span css={{ userSelect: 'none' }} contentEditable={false} {...props}>
    {children}
  </span>
);

type Comp<Props> = (props: Props) => ReactElement | null;

type ValueForRenderingFromComponentPropField<Prop extends ComponentSchema> = Prop extends ChildField
  ? ReactNode
  : Prop extends FormField<infer Value, any>
  ? Value
  : Prop extends ObjectField<infer Value>
  ? { readonly [Key in keyof Value]: ValueForRenderingFromComponentPropField<Value[Key]> }
  : Prop extends ConditionalField<infer DiscriminantField, infer Values>
  ? {
      readonly [Key in keyof Values]: {
        readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>;
        readonly value: ValueForRenderingFromComponentPropField<Values[Key]>;
      };
    }[keyof Values]
  : Prop extends RelationshipField<infer Many>
  ? Many extends true
    ? readonly HydratedRelationshipData[]
    : HydratedRelationshipData | null
  : Prop extends ArrayField<infer ElementField>
  ? readonly ValueForRenderingFromComponentPropField<ElementField>[]
  : never;

export type ValueForComponentSchema<Prop extends ComponentSchema> = Prop extends ChildField
  ? null
  : Prop extends FormField<infer Value, any>
  ? Value
  : Prop extends ObjectField<infer Value>
  ? { readonly [Key in keyof Value]: ValueForRenderingFromComponentPropField<Value[Key]> }
  : Prop extends ConditionalField<infer DiscriminantField, infer Values>
  ? {
      readonly [Key in keyof Values]: {
        readonly discriminant: DiscriminantStringToDiscriminantValue<DiscriminantField, Key>;
        readonly value: ValueForRenderingFromComponentPropField<Values[Key]>;
      };
    }[keyof Values]
  : Prop extends RelationshipField<infer Many>
  ? Many extends true
    ? readonly HydratedRelationshipData[]
    : HydratedRelationshipData | null
  : Prop extends ArrayField<infer ElementField>
  ? readonly ValueForRenderingFromComponentPropField<ElementField>[]
  : never;

type ExtractPropsForPropsForRendering<Props extends Record<string, ComponentSchema>> = {
  readonly [Key in keyof Props]: ValueForRenderingFromComponentPropField<Props[Key]>;
};

export type InferRenderersForComponentBlocks<
  ComponentBlocks extends Record<string, ComponentBlock<any>>
> = {
  [Key in keyof ComponentBlocks]: Comp<
    ExtractPropsForPropsForRendering<ComponentBlocks[Key]['schema']>
  >;
};
