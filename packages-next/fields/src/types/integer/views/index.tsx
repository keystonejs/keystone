/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { CellLink, CellContainer } from '@keystone-next/admin-ui/components';

import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel>{field.label}</FieldLabel>
    {onChange ? (
      <TextInput
        autoFocus={autoFocus}
        type="number"
        onChange={event => {
          onChange(event.target.value.replace(/\D/g, ''));
        }}
        value={value}
      />
    ) : (
      value
    )}
  </FieldContainer>
);

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};

export const controller = (config: FieldControllerConfig): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: data => {
      const value = data[config.path];
      return typeof value === 'number' ? value + '' : '';
    },
    serialize: value => ({ [config.path]: value === '' ? null : parseInt(value, 10) }),
    filter: {
      Filter(props) {
        return (
          <TextInput
            type="number"
            onChange={event => {
              props.onChange(event.target.value.replace(/[^\d,\s]/g, ''));
            }}
            value={props.value}
            autoFocus={props.autoFocus}
          />
        );
      },

      graphql: ({ type, value }) => {
        const key = type === 'is' ? config.path : `${config.path}_${type}`;
        const valueWithoutWhitespace = value.replace(/\s/g, '');

        return {
          [key]: ['in', 'not_in'].includes(type)
            ? valueWithoutWhitespace.split(',').map(i => parseInt(i))
            : parseInt(valueWithoutWhitespace),
        };
      },
      Label({ label, value, type }) {
        let renderedValue = value;
        if (['in', 'not_in'].includes(type)) {
          renderedValue = value
            .split(',')
            .map(value => value.trim())
            .join(', ');
        }
        return `${label.toLowerCase()}: ${renderedValue}`;
      },
      types: {
        is: {
          label: 'Is exactly',
          initialValue: '',
        },
        not: {
          label: 'Is not exactly',
          initialValue: '',
        },
        gt: {
          label: 'Is greater than',
          initialValue: '',
        },
        lt: {
          label: 'Is less than',
          initialValue: '',
        },
        gte: {
          label: 'Is greater than or equal to',
          initialValue: '',
        },
        lte: {
          label: 'Is less than or equal to',
          initialValue: '',
        },
        in: {
          label: 'Is one of',
          initialValue: '',
        },
        not_in: {
          label: 'Is not one of',
          initialValue: '',
        },
      },
    },
  };
};
