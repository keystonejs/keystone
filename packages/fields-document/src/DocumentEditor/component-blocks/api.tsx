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

export type FormField<Value, Options> = {
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

export type RelationshipField<Cardinality extends 'one' | 'many'> = {
  kind: 'relationship';
  relationship: string;
  label: string;
  cardinality?: Cardinality;
};

export interface ObjectField<
  Value extends Record<string, ComponentPropField> = Record<string, ComponentPropField>
> {
  kind: 'object';
  value: Value;
}

export type ConditionalField<
  Discriminant extends string | boolean,
  ConditionalValue extends [Discriminant] extends [boolean]
    ? { true: ComponentPropField; false: ComponentPropField }
    : [Discriminant] extends [string]
    ? { [Key in Discriminant]: ComponentPropField }
    : never,
  DiscriminantOptions
> = {
  kind: 'conditional';
  discriminant: FormField<Discriminant, DiscriminantOptions>;
  values: ConditionalValue;
};

export type ComponentPropField =
  | ChildField
  | FormField<any, any>
  | ObjectField
  | ConditionalField<any, any, any>
  | RelationshipField<'one' | 'many'>;

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
  empty(): FormField<undefined, undefined> {
    return {
      kind: 'form',
      Input() {
        return null;
      },
      options: undefined,
      defaultValue: undefined,
      validate(value) {
        return value === undefined;
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
  object<Value extends Record<string, ComponentPropField>>(value: Value): ObjectField<Value> {
    return { kind: 'object', value };
  },
  conditional<
    Discriminant extends string | boolean,
    ConditionalValue extends [Discriminant] extends [boolean]
      ? { true: ComponentPropField; false: ComponentPropField }
      : [Discriminant] extends [string]
      ? { [Key in Discriminant]: ComponentPropField }
      : never,
    DiscriminantOptions
  >(
    discriminant: FormField<Discriminant, DiscriminantOptions>,
    values: ConditionalValue
  ): ConditionalField<Discriminant, ConditionalValue, DiscriminantOptions> {
    return {
      kind: 'conditional',
      discriminant,
      values: values,
    };
  },
  relationship<Cardinality extends 'one' | 'many'>({
    relationship,
    label,
  }: {
    relationship: string;
    label: string;
  }): RelationshipField<Cardinality> {
    return { kind: 'relationship', relationship, label };
  },
};

export type ComponentBlock<
  Props extends Record<string, ComponentPropField> = Record<string, ComponentPropField>
> = {
  component: (props: any) => ReactElement | null;
  props: Props;
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

type DiscriminantToString<Discriminant extends string | boolean> = Discriminant extends boolean
  ? 'true' | 'false'
  : Discriminant;

type CastToComponentPropField<Prop> = Prop extends ComponentPropField ? Prop : never;

export type ExtractPropFromComponentPropFieldForPreview<Prop extends ComponentPropField> =
  Prop extends ChildField
    ? ReactNode
    : Prop extends FormField<infer Value, infer Options>
    ? { readonly value: Value; onChange(value: Value): void; readonly options: Options }
    : Prop extends ObjectField<infer Value>
    ? { readonly [Key in keyof Value]: ExtractPropFromComponentPropFieldForPreview<Value[Key]> }
    : Prop extends ConditionalField<infer Discriminant, infer Value, infer DiscriminantOptions>
    ? {
        readonly [Key in DiscriminantToString<Discriminant>]: {
          readonly discriminant: Discriminant extends boolean
            ? 'true' extends Key
              ? true
              : 'false' extends Key
              ? false
              : never
            : Discriminant;
          onChange(discriminant: Discriminant): void;
          readonly options: DiscriminantOptions;
          readonly value: Key extends keyof Value
            ? ExtractPropFromComponentPropFieldForPreview<CastToComponentPropField<Value[Key]>>
            : never;
        };
      }[DiscriminantToString<Discriminant>]
    : Prop extends RelationshipField<infer Cardinality>
    ? {
        one: {
          readonly value: HydratedRelationshipData | null;
          onChange(relationshipData: HydratedRelationshipData | null): void;
        };
        many: {
          readonly value: readonly HydratedRelationshipData[];
          onChange(relationshipData: readonly HydratedRelationshipData[]): void;
        };
      }[Cardinality]
    : never;

type ExtractPropFromComponentPropFieldForToolbar<Prop extends ComponentPropField> =
  Prop extends ChildField
    ? undefined
    : Prop extends FormField<infer Value, infer Options>
    ? { readonly value: Value; onChange(value: Value): void; readonly options: Options }
    : Prop extends ObjectField<infer Value>
    ? { readonly [Key in keyof Value]: ExtractPropFromComponentPropFieldForToolbar<Value[Key]> }
    : Prop extends ConditionalField<infer Discriminant, infer Value, infer DiscriminantOptions>
    ? {
        readonly [Key in DiscriminantToString<Discriminant>]: {
          readonly discriminant: Discriminant extends boolean
            ? 'true' extends Key
              ? true
              : 'false' extends Key
              ? false
              : never
            : Discriminant;
          onChange(discriminant: Discriminant): void;
          readonly options: DiscriminantOptions;
          readonly value: Key extends keyof Value
            ? ExtractPropFromComponentPropFieldForToolbar<CastToComponentPropField<Value[Key]>>
            : never;
        };
      }[DiscriminantToString<Discriminant>]
    : Prop extends RelationshipField<infer Cardinality>
    ? {
        one: {
          readonly value: HydratedRelationshipData | null;
          onChange(relationshipData: HydratedRelationshipData | null): void;
        };
        many: {
          readonly value: readonly HydratedRelationshipData[];
          onChange(relationshipData: readonly HydratedRelationshipData[]): void;
        };
      }[Cardinality]
    : never;

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
  PropsOption extends {
    [Key in any]: ComponentPropField;
  }
>(
  options: {
    /** The preview component shown in the editor */
    component: (props: {
      [Key in keyof PropsOption]: ExtractPropFromComponentPropFieldForPreview<PropsOption[Key]>;
    }) => ReactElement | null;
    /** The props that the preview component, toolbar and rendered component will receive */
    props: PropsOption;
    /** The label to show in the insert menu and chrome around the block if chromeless is false */
    label: string;
  } & (
    | {
        chromeless: true;
        toolbar?: (props: {
          props: {
            [Key in keyof PropsOption]: ExtractPropFromComponentPropFieldForToolbar<
              PropsOption[Key]
            >;
          };
          onRemove(): void;
        }) => ReactElement;
      }
    | {
        chromeless?: false;
        toolbar?: (props: {
          props: {
            [Key in keyof PropsOption]: ExtractPropFromComponentPropFieldForToolbar<
              PropsOption[Key]
            >;
          };
          onShowEditMode(): void;
          onRemove(): void;
        }) => ReactElement;
      }
  )
): ComponentBlock<PropsOption> {
  return options as any;
}

export const NotEditable = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <span css={{ userSelect: 'none' }} contentEditable={false} {...props}>
    {children}
  </span>
);

type Comp<Props> = (props: Props) => ReactElement | null;

type ExtractPropFromComponentPropFieldForRendering<Prop extends ComponentPropField> =
  Prop extends ChildField
    ? ReactNode
    : Prop extends FormField<infer Value, any>
    ? Value
    : Prop extends ObjectField<infer Value>
    ? { readonly [Key in keyof Value]: ExtractPropFromComponentPropFieldForRendering<Value[Key]> }
    : Prop extends ConditionalField<infer Discriminant, infer Value, any>
    ? {
        readonly [Key in DiscriminantToString<Discriminant>]: {
          readonly discriminant: Discriminant extends boolean
            ? 'true' extends Key
              ? true
              : 'false' extends Key
              ? false
              : never
            : Discriminant;
          readonly value: Key extends keyof Value
            ? ExtractPropFromComponentPropFieldForRendering<CastToComponentPropField<Value[Key]>>
            : never;
        };
      }[DiscriminantToString<Discriminant>]
    : Prop extends RelationshipField<infer Cardinality>
    ? {
        one: HydratedRelationshipData | null;
        many: readonly HydratedRelationshipData[];
      }[Cardinality]
    : never;

type ExtractPropsForPropsForRendering<Props extends Record<string, ComponentPropField>> = {
  readonly [Key in keyof Props]: ExtractPropFromComponentPropFieldForRendering<Props[Key]>;
};

export type InferRenderersForComponentBlocks<
  ComponentBlocks extends Record<string, ComponentBlock<any>>
> = {
  [Key in keyof ComponentBlocks]: Comp<
    ExtractPropsForPropsForRendering<ComponentBlocks[Key]['props']>
  >;
};
