/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { useState } from 'react';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '../../../../types';
import { CellLink, CellContainer } from '../../../../admin-ui/components';
import { useFormattedInput } from './utils';

function IntegerInput({
  value,
  onChange,
  id,
  autoFocus,
  forceValidation,
  validationMessage,
  placeholder,
}: {
  id: string;
  autoFocus?: boolean;
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  forceValidation?: boolean;
  validationMessage?: string;
  placeholder?: string;
}) {
  const [hasBlurred, setHasBlurred] = useState(false);
  const props = useFormattedInput<number | null>(
    {
      format: value => (value === null ? '' : value.toString()),
      parse: raw => {
        raw = raw.trim();
        if (raw === '') {
          return null;
        }
        if (/^[+-]?\d+$/.test(raw)) {
          let parsed = parseInt(raw);
          if (!Number.isSafeInteger(parsed)) {
            return raw;
          }
          return parsed;
        }
        return raw;
      },
    },
    {
      value,
      onChange,
      onBlur: () => {
        setHasBlurred(true);
      },
    }
  );
  return (
    <span>
      <TextInput
        placeholder={placeholder}
        id={id}
        autoFocus={autoFocus}
        inputMode="numeric"
        {...props}
      />
      {(hasBlurred || forceValidation) && validationMessage && (
        <span css={{ color: 'red' }}>{validationMessage}</span>
      )}
    </span>
  );
}

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const message = validate(value, field.validation, field.label, field.hasAutoIncrementDefault);

  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      {onChange ? (
        <span>
          <IntegerInput
            id={field.path}
            autoFocus={autoFocus}
            onChange={val => {
              onChange({ ...value, value: val });
            }}
            value={value.value}
            forceValidation={forceValidation}
            placeholder={
              field.hasAutoIncrementDefault && value.kind === 'create'
                ? 'Defaults to an incremented number'
                : undefined
            }
            validationMessage={message}
          />
        </span>
      ) : (
        value.value
      )}
    </FieldContainer>
  );
};

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path] === null ? '' : item[field.path]}
    </FieldContainer>
  );
};

function validate(
  value: Value,
  validation: Validation,
  label: string,
  hasAutoIncrementDefault: boolean
): string | undefined {
  const val = value.value;
  if (typeof val === 'string') {
    return `${label} must be a whole number`;
  }

  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === 'update' && value.initial === null && val === null) {
    return undefined;
  }

  if (value.kind === 'create' && value.value === null && hasAutoIncrementDefault) {
    return undefined;
  }

  if (validation.isRequired && val === null) {
    return `${label} is required`;
  }
  if (typeof val === 'number') {
    if (val < validation.min) {
      return `${label} must be greater than or equal to ${validation.min}`;
    }
    if (val > validation.max) {
      return `${label} must be less than or equal to ${validation.max}`;
    }
  }

  return undefined;
}

type Validation = {
  isRequired: boolean;
  min: number;
  max: number;
};

type Value =
  | { kind: 'update'; initial: number | null; value: string | number | null }
  | { kind: 'create'; value: string | number | null };

export const controller = (
  config: FieldControllerConfig<{
    validation: Validation;
    defaultValue: number | null | 'autoincrement';
  }>
): FieldController<Value, string> & {
  validation: Validation;
  hasAutoIncrementDefault: boolean;
} => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: {
      kind: 'create',
      value:
        config.fieldMeta.defaultValue === 'autoincrement' ? null : config.fieldMeta.defaultValue,
    },
    deserialize: data => ({ kind: 'update', value: data[config.path], initial: data[config.path] }),
    serialize: value => ({ [config.path]: value.value }),
    hasAutoIncrementDefault: config.fieldMeta.defaultValue === 'autoincrement',
    validate: value =>
      validate(
        value,
        config.fieldMeta.validation,
        config.label,
        config.fieldMeta.defaultValue === 'autoincrement'
      ) === undefined,
    filter: {
      Filter(props) {
        return (
          <TextInput
            // this should not be type=number since it shoud allow commas so the one of/not one of
            // filters work but really the whole filtering UI needs to be fixed and just removing type=number
            // while doing nothing else would probably make it worse since anything would be allowed in the input
            // so when a user applies the filter, the query would return an error
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
        const valueWithoutWhitespace = value.replace(/\s/g, '');
        const parsed =
          type === 'in' || type === 'not_in'
            ? valueWithoutWhitespace.split(',').map(x => parseInt(x))
            : parseInt(valueWithoutWhitespace);
        if (type === 'not') {
          return { [config.path]: { not: { equals: parsed } } };
        }
        const key = type === 'is' ? 'equals' : type === 'not_in' ? 'notIn' : type;
        return { [config.path]: { [key]: parsed } };
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
