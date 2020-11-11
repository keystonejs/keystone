/* @jsx jsx */

import { parseISO } from 'date-fns';
import { Fragment, useState } from 'react';

import { CellContainer, CellLink } from '@keystone-next/admin-ui/components';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';

// TODO: Bring across the datetime/datetimeUtc interfaces, date picker, etc.

function formatOutput(value: string) {
  if (!value) return '';
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export const Field = ({
  field,
  value,
  onChange,
  forceValidation,
  autoFocus,
}: FieldProps<typeof controller>) => {
  const [touched, setTouched] = useState(false);
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {onChange ? (
        <Fragment>
          <TextInput
            autoFocus={autoFocus}
            disabled={onChange === undefined}
            onChange={event => {
              onChange(event.target.value);
            }}
            onBlur={() => {
              setTouched(true);
            }}
            placeholder="0000-00-00T00:00:00.000Z"
            value={value}
          />
          {(touched || forceValidation) && !isValid(value) && (
            <div css={{ color: 'red' }}>
              Timestamps must be in the form 0000-00-00T00:00:00.000Z
            </div>
          )}
        </Fragment>
      ) : (
        formatOutput(value)
      )}
    </FieldContainer>
  );
};

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path];
  return linkTo ? (
    <CellLink {...linkTo}>{formatOutput(value)}</CellLink>
  ) : (
    <CellContainer>{formatOutput(value)}</CellContainer>
  );
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

function isValid(value: string) {
  if (value === '') return true;
  try {
    return parseISO(value).toISOString() === value;
  } catch (err) {
    return false;
  }
}

export const controller = (config: FieldControllerConfig): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: data => data[config.path] || '',
    serialize: value => ({ [config.path]: value === '' ? null : value }),
    validate(value) {
      return isValid(value);
    },
  };
};
