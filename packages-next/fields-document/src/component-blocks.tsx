/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { Select } from '@keystone-ui/fields';
import { ReactElement, ReactNode } from 'react';

export type FormField<Value> = {
  kind: 'form';
  Input(props: {
    value: Value;
    onChange(value: Value): void;
    path: (string | number)[];
  }): ReactElement | null;
  defaultValue: Value;
};

export type InlineField = {
  kind: 'inline';
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
  | ConditionalField<any, any>;

export const fields = {
  text({ label }: { label: string }): FormField<string> {
    return {
      kind: 'form',
      Input({ value, onChange }) {
        return (
          <label>
            {label}
            <input
              value={value}
              onChange={event => {
                onChange(event.target.value);
              }}
            />
          </label>
        );
      },
      defaultValue: '',
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
      Input({ value, onChange }) {
        return (
          <label>
            {label}
            <Select
              value={options.find(option => option.value === value) || null}
              onChange={option => {
                if (option) {
                  onChange(option.value);
                }
              }}
            />
          </label>
        );
      },
      defaultValue,
    };
  },
  checkbox({ label }: { label: string }): FormField<boolean> {
    return {
      kind: 'form',
      Input({ value, onChange }) {
        return (
          <label>
            {label}
            <input
              type="checkbox"
              checked={value}
              onChange={event => {
                onChange(event.target.checked);
              }}
            />
          </label>
        );
      },
      defaultValue: false,
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
};

export type ComponentBlock = {
  component: (props: any) => ReactElement | null;
  props: Record<string, ComponentPropField>;
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
  ? { [Key in keyof Value]: ExtractPropFromComponentPropField<Value[Key]> }
  : [Prop] extends [ConditionalField<infer Discriminant, infer Value>]
  ? {
      [Key in DiscriminantToString<Discriminant>]: {
        discriminant: Discriminant extends boolean
          ? 'true' extends Key
            ? true
            : 'false' extends Key
            ? false
            : never
          : Discriminant;
        value: Key extends keyof Value
          ? ExtractPropFromComponentPropField<CastToComponentPropField<Value[Key]>>
          : never;
      };
    }[DiscriminantToString<Discriminant>]
  : 'fields must be one of ComponentPropField, not a union of multiple of them';

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
}): ComponentBlock {
  return options;
}

export const NotEditable = ({ children, ...props }: { children: ReactNode }) => (
  <span contentEditable={false} {...props}>
    {children}
  </span>
);
