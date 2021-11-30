import React from 'react';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { CellLink, CellContainer } from '@keystone-6/core/admin-ui/components';

import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-6/core/types';
import { StarsInput } from './stars-input';

// this is the component shown in the create modal and item page
export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => (
  <FieldContainer as="fieldset">
    <FieldLabel as="legend">{field.label}</FieldLabel>
    <StarsInput maxStars={field.maxStars} onChange={onChange} value={value} autoFocus={autoFocus} />
  </FieldContainer>
);

// this is shown on the list view in the table
export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
// setting supportsLinksTo means the cell component allows containing a link to the item
// for example, text fields support it but relationship fields don't because
// their cell component links to the related item so it can't link to the item that the relationship is on
Cell.supportsLinkTo = true;

// this is shown on the item page in relationship fields with `displayMode: 'cards'`
export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};

export const controller = (
  // the type parameter here needs to align with what is returned from `getAdminMeta`
  // in the server-side portion of the field type
  config: FieldControllerConfig<{ maxStars: number }>
): FieldController<number | null, string> & { maxStars: number } => {
  return {
    maxStars: config.fieldMeta.maxStars,
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: data => {
      const value = data[config.path];
      return typeof value === 'number' ? value : null;
    },
    serialize: value => ({ [config.path]: value }),
    filter: {
      Filter(props) {
        return (
          <TextInput
            type="number"
            onChange={event => {
              props.onChange(event.target.value.replace(/[^\d,\s-]/g, ''));
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
