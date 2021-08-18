/* @jsx jsx */
import { Fragment } from 'react';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, MultiSelect, Select } from '@keystone-ui/fields';
import { SegmentedControl } from '@keystone-ui/segmented-control';
import { CellContainer, CellLink } from '../../../../admin-ui/components';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer as={field.displayMode === 'select' ? 'div' : 'fieldset'}>
    {field.displayMode === 'select' ? (
      <Fragment>
        <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
        <Select
          id={field.path}
          isClearable
          autoFocus={autoFocus}
          options={field.options}
          isDisabled={onChange === undefined}
          onChange={value => {
            onChange?.(value);
          }}
          value={value}
          portalMenu
        />
      </Fragment>
    ) : (
      <Fragment>
        <FieldLabel as="legend">{field.label}</FieldLabel>
        <SegmentedControl
          segments={field.options.map(x => x.label)}
          selectedIndex={value ? field.options.findIndex(x => x.value === value.value) : undefined}
          onChange={index => {
            onChange?.(field.options[index]);
          }}
        />
      </Fragment>
    )}
  </FieldContainer>
);

export const Cell: CellComponent<typeof controller> = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  const label = field.options.find(x => x.value === value)?.label;
  return linkTo ? <CellLink {...linkTo}>{label}</CellLink> : <CellContainer>{label}</CellContainer>;
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent<typeof controller> = ({ item, field }) => {
  const label = field.options.find(x => x.value === item[field.path])?.label;

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {label}
    </FieldContainer>
  );
};

type Config = FieldControllerConfig<{
  options: { label: string; value: string | number }[];
  dataType: 'string' | 'enum' | 'integer';
  displayMode: 'select' | 'segmented-control';
}>;

export const controller = (
  config: Config
): FieldController<{ label: string; value: string } | null, { label: string; value: string }[]> & {
  options: { label: string; value: string }[];
  dataType: 'string' | 'enum' | 'integer';
  displayMode: 'select' | 'segmented-control';
} => {
  const optionsWithStringValues = config.fieldMeta.options.map(x => ({
    label: x.label,
    value: x.value.toString(),
  }));

  // Transform from string value to dataType appropriate value
  const t = (v: string | null) =>
    v === null ? null : config.fieldMeta.dataType === 'integer' ? parseInt(v) : v;

  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: null,
    dataType: config.fieldMeta.dataType,
    displayMode: config.fieldMeta.displayMode,
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
    serialize: value => ({ [config.path]: t(value?.value ?? null) }),
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
      graphql: ({ type, value: options }) => ({
        [config.path]: { [type === 'not_matches' ? 'notIn' : 'in']: options.map(x => t(x.value)) },
      }),
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
