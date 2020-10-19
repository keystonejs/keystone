/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, Select, MultiSelect } from '@keystone-ui/fields';
import { CellLink, CellContainer } from '@keystone-spike/admin-ui/components';

import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-spike/types';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    <div css={{ display: 'inline-flex' }}>
      <Select
        isClearable
        autoFocus={autoFocus}
        options={field.options}
        isDisabled={onChange === undefined}
        onChange={value => {
          onChange?.(value);
        }}
        value={value}
      />
    </div>
  </FieldContainer>
);

export const Cell: CellComponent<typeof controller> = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  const label = field.options.find(x => x.value === value)?.label;
  return linkTo ? <CellLink {...linkTo}>{label}</CellLink> : <CellContainer>{label}</CellContainer>;
};
Cell.supportsLinkTo = true;

type Config = FieldControllerConfig<{
  options: { label: string; value: string | number }[];
  dataType: 'string' | 'enum' | 'integer';
}>;

export const controller = (
  config: Config
): FieldController<{ label: string; value: string } | null, { label: string; value: string }[]> & {
  options: { label: string; value: string }[];
  dataType: 'string' | 'enum' | 'integer';
} => {
  const optionsWithStringValues = config.fieldMeta.options.map(x => ({
    label: x.label,
    value: x.value.toString(),
  }));
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: null,
    dataType: config.fieldMeta.dataType,
    options: optionsWithStringValues,
    deserialize: data => {
      for (const option of config.fieldMeta.options) {
        if (option.value === data[config.path]) {
          return {
            label: option.label,
            value: option.value.toString(),
          };
        }
      }
      return null;
    },
    serialize: value => ({ [config.path]: value?.value ?? null }),
    filter: {
      Filter(props) {
        return (
          <MultiSelect
            onChange={props.onChange}
            options={optionsWithStringValues}
            value={props.value}
            autoFocus
          />
        );
      },

      graphql: ({ type, value: options }) => {
        const inverted = type === 'not_matches';

        if (!options.length) {
          return {
            [`${config.path}${inverted ? '_not' : ''}`]: null,
          };
        }

        const isMulti = options.length > 1;

        let key = config.path;
        if (isMulti && inverted) {
          key = `${config.path}_not_in`;
        } else if (isMulti) {
          key = `${config.path}_in`;
        } else if (inverted) {
          key = `${config.path}_not`;
        }

        const value = isMulti ? options.map(x => x.value) : options[0].value;

        return { [key]: value };
      },
      Label({ type, value }) {
        if (!value.length) {
          return type === 'not_matches' ? `is set` : `has no value`;
        }
        if (value.length > 1) {
          const values = value.map(i => i.label).join(', ');
          return type === 'not_matches' ? `is not in [${values}]` : `is in [${values}]`;
        }
        const optionLabel = value[0].label;
        return type === 'not_matches' ? `is not ${optionLabel}` : `is ${optionLabel}`;
      },
      types: {
        matches: {
          label: 'Matches',
          initialValue: [],
        },
        not_matches: {
          label: 'Does not match',
          initialValue: [],
        },
      },
    },
  };
};
