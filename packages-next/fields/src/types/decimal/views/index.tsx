/* @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { CellLink, CellContainer } from '@keystone-next/keystone/admin-ui/components';
import slugify from '@sindresorhus/slugify';

import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const fieldId = slugify(field.label);
  return (
    <FieldContainer>
      <FieldLabel htmlFor={fieldId}>{field.label}</FieldLabel>
      {onChange ? (
        <TextInput
          id={fieldId}
          autoFocus={autoFocus}
          onChange={event => onChange(event.target.value.replace(/[^\d\.-]/, ''))}
          value={value}
        />
      ) : (
        value
      )}
    </FieldContainer>
  );
};

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] || '';
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

type Config = FieldControllerConfig<{
  precision: number;
  scale: number;
}>;

export const controller = (config: Config): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: data => data[config.path] || '',
    serialize: value => ({ [config.path]: value === '' ? null : value }),
    filter: {
      Filter(props) {
        return (
          <TextInput
            onChange={event => {
              props.onChange(event.target.value.replace(/[^\d\.,\s-]/g, ''));
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
            ? valueWithoutWhitespace.split(',').map(i => i)
            : valueWithoutWhitespace,
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
