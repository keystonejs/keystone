/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, Select, TextInput, Checkbox } from '@keystone-ui/fields';
import { HTMLAttributes, ReactElement, ReactNode } from 'react';

export type FormField<Value, Options> = {
  kind: 'form';
  Input(props: {
    value: Value;
    onChange(value: Value): void;
    path: (string | number)[];
    autoFocus: boolean;
  }): ReactElement | null;
  options: Options;
  defaultValue: Value;
};

export type ChildField = {
  kind: 'child';
  options:
    | {
        kind: 'block';
        placeholder: string;
        // dividers: boolean;
        // formatting: {
        //   blockTypes: boolean;
        //   headingLevels: (1 | 2 | 3 | 4 | 5 | 6)[];
        //   inlineMarks: boolean;
        //   lists: boolean;
        // };
        // links: boolean;
      }
    | {
        kind: 'inline';
        placeholder: string;
        // formatting: { inlineMarks: boolean };
        // links: boolean;
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
            />
          </FieldContainer>
        );
      },
      options,
      defaultValue,
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
    };
  },
  child(
    options:
      | {
          kind: 'block';
          placeholder: string;
          // dividers?: true;
          // formatting?:
          //   | {
          //       blockTypes?: true;
          //       headingLevels?: (1 | 2 | 3 | 4 | 5 | 6)[];
          //       inlineMarks?: true;
          //       lists?: true;
          //     }
          //   | true;
          // links?: true;
        }
      | {
          kind: 'inline';
          placeholder: string;
          // formatting?: true;
          // links?: true;
        }
  ): ChildField {
    return {
      kind: 'child',
      options:
        options.kind === 'block'
          ? {
              kind: 'block',
              placeholder: options.placeholder,
              // dividers: options.dividers ?? true,
              // formatting:
              //   options.formatting === true
              //     ? {
              //         blockTypes: true,
              //         headingLevels: [1, 2, 3, 4, 5, 6],
              //         inlineMarks: true,
              //         lists: true,
              //       }
              //     : {
              //         blockTypes: options.formatting?.blockTypes ?? false,
              //         headingLevels: options.formatting?.headingLevels ?? [],
              //         inlineMarks: options.formatting?.inlineMarks ?? false,
              //         lists: options.formatting?.lists ?? false,
              //       },
              // links: options.links ?? false,
            }
          : {
              kind: 'inline',
              placeholder: options.placeholder,
              // formatting: { inlineMarks: options.formatting ?? false },
              // links: options.links ?? false,
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

export type ComponentBlock = {
  component: (props: any) => ReactElement | null;
  props: Record<string, ComponentPropField>;
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
      }) => ReactElement;
    }
);

type DiscriminantToString<Discriminant extends string | boolean> = Discriminant extends boolean
  ? 'true' | 'false'
  : Discriminant;

type CastToComponentPropField<Prop> = Prop extends ComponentPropField ? Prop : never;

type ExtractPropFromComponentPropFieldForPreview<Prop extends ComponentPropField> = [Prop] extends [
  ChildField
]
  ? ReactNode
  : [Prop] extends [FormField<infer Value, infer Options>]
  ? { readonly value: Value; onChange(value: Value): void; readonly options: Options }
  : [Prop] extends [ObjectField<infer Value>]
  ? { readonly [Key in keyof Value]: ExtractPropFromComponentPropFieldForPreview<Value[Key]> }
  : [Prop] extends [ConditionalField<infer Discriminant, infer Value, infer DiscriminantOptions>]
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
  : [Prop] extends [RelationshipField<infer Cardinality>]
  ? {
      one: {
        readonly value: RelationshipData | null;
        onChange(relationshipData: RelationshipData | null): void;
      };
      many: {
        readonly value: readonly RelationshipData[];
        onChange(relationshipData: readonly RelationshipData[]): void;
      };
    }[Cardinality]
  : 'fields must be one of ComponentPropField, not a union of multiple of them';

type ExtractPropFromComponentPropFieldForToolbar<Prop extends ComponentPropField> = [Prop] extends [
  ChildField
]
  ? undefined
  : [Prop] extends [FormField<infer Value, infer Options>]
  ? { readonly value: Value; onChange(value: Value): void; readonly options: Options }
  : [Prop] extends [ObjectField<infer Value>]
  ? { readonly [Key in keyof Value]: ExtractPropFromComponentPropFieldForToolbar<Value[Key]> }
  : [Prop] extends [ConditionalField<infer Discriminant, infer Value, infer DiscriminantOptions>]
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
  : [Prop] extends [RelationshipField<infer Cardinality>]
  ? {
      one: {
        readonly value: RelationshipData | null;
        onChange(relationshipData: RelationshipData | null): void;
      };
      many: {
        readonly value: readonly RelationshipData[];
        onChange(relationshipData: readonly RelationshipData[]): void;
      };
    }[Cardinality]
  : 'fields must be one of ComponentPropField, not a union of multiple of them';

export type RelationshipData = {
  readonly id: string;
  readonly label: string | null;
  readonly data: Record<string, any>;
};

export function component<
  PropsOption extends {
    [Key in any]: ComponentPropField;
  }
>(
  options: {
    component: (
      props: {
        [Key in keyof PropsOption]: ExtractPropFromComponentPropFieldForPreview<PropsOption[Key]>;
      }
    ) => ReactElement | null;
    props: PropsOption;
    label: string;
    // icon?: ReactElement;
    // position?: 'toolbar' | 'insert-menu';
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
): ComponentBlock {
  return options as any;
}

export const NotEditable = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div css={{ userSelect: 'none' }} contentEditable={false} {...props}>
    {children}
  </div>
);
