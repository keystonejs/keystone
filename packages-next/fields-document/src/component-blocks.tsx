/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, Select, TextInput, Checkbox } from '@keystone-ui/fields';
import { ReactElement, ReactNode } from 'react';

export type FormField<Value> = {
  kind: 'form';
  Input(props: {
    value: Value;
    onChange(value: Value): void;
    path: (string | number)[];
    autoFocus: boolean;
  }): ReactElement | null;
  defaultValue: Value;
};

export type InlineField = {
  kind: 'inline';
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
    : never
> = {
  kind: 'conditional';
  discriminant: FormField<Discriminant>;
  values: ConditionalValue;
};

export type ComponentPropField =
  | InlineField
  | FormField<any>
  | ObjectField
  | ConditionalField<any, any>
  | RelationshipField<'one' | 'many'>;

export const fields = {
  text({ label, defaultValue = '' }: { label: string; defaultValue?: string }): FormField<string> {
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
      defaultValue,
    };
  },
  select({
    label,
    options,
    defaultValue,
  }: {
    label: string;
    options: { label: string; value: string }[];
    defaultValue: string;
  }): FormField<string> {
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
      defaultValue,
    };
  },
  checkbox({
    label,
    defaultValue = false,
  }: {
    label: string;
    defaultValue?: boolean;
  }): FormField<boolean> {
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
      defaultValue,
    };
  },
  empty(): FormField<undefined> {
    return {
      kind: 'form',
      Input() {
        return null;
      },
      defaultValue: undefined,
    };
  },
  child(): InlineField {
    return {
      kind: 'inline',
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
      : never
  >(
    discriminant: FormField<Discriminant>,
    values: ConditionalValue
  ): ConditionalField<Discriminant, ConditionalValue> {
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
};

type DiscriminantToString<Discriminant extends string | boolean> = Discriminant extends boolean
  ? 'true' | 'false'
  : Discriminant;

type CastToComponentPropField<Prop> = Prop extends ComponentPropField ? Prop : never;

type ExtractPropFromComponentPropField<Prop extends ComponentPropField> = [Prop] extends [
  InlineField
]
  ? ReactNode
  : [Prop] extends [FormField<infer Value>]
  ? Value
  : [Prop] extends [ObjectField<infer Value>]
  ? { readonly [Key in keyof Value]: ExtractPropFromComponentPropField<Value[Key]> }
  : [Prop] extends [ConditionalField<infer Discriminant, infer Value>]
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
          ? ExtractPropFromComponentPropField<CastToComponentPropField<Value[Key]>>
          : never;
      };
    }[DiscriminantToString<Discriminant>]
  : [Prop] extends [RelationshipField<infer Cardinality>]
  ? {
      one: RelationshipData | null;
      many: readonly RelationshipData[];
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
>(options: {
  component: (
    props: {
      [Key in keyof PropsOption]: ExtractPropFromComponentPropField<PropsOption[Key]>;
    }
  ) => ReactElement | null;
  props: PropsOption;
  label: string;
  // icon?: ReactElement;
  // position?: 'toolbar' | 'insert-menu';
}): ComponentBlock {
  return options;
}

export const NotEditable = ({ children, ...props }: { children: ReactNode }) => (
  <span css={{ userSelect: 'none' }} contentEditable={false} {...props}>
    {children}
  </span>
);
