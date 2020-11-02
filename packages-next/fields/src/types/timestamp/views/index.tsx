/* @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { CellLink, CellContainer } from '@keystone-next/admin-ui/components';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { parseISO } from 'date-fns';

import {
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { useState } from 'react';

// TODO: Bring across the datetime/datetimeUtc interfaces, date picker, etc.

export const Field = ({
  field,
  value,
  onChange,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const [touched, setTouched] = useState(false);
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      <TextInput
        readOnly={onChange === undefined}
        onChange={event => {
          onChange?.(event.target.value);
        }}
        onBlur={() => {
          setTouched(true);
        }}
        placeholder="0000-00-00T00:00:00.000Z"
        value={value}
      />
      {(touched || forceValidation) && !isValid(value) && (
        <div css={{ color: 'red' }}>Timestamps must be in the form 0000-00-00T00:00:00.000Z</div>
      )}
    </FieldContainer>
  );
};

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path];
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
Cell.supportsLinkTo = true;

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
