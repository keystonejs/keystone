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
  validation,
  label,
}: {
  id: string;
  autoFocus?: boolean;
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  forceValidation?: boolean;
  validation: Validation;
  label: string;
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
  const validationMessage = validate(value, validation, label);
  return (
    <span>
      <TextInput id={id} autoFocus={autoFocus} inputMode="numeric" {...props} />
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
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      {onChange ? (
        <IntegerInput
          id={field.path}
          autoFocus={autoFocus}
          onChange={onChange}
          value={value}
          validation={field.validation}
          label={field.label}
        />
      ) : (
        value
      )}
      {forceValidation && 'invalid!'}
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
  value: string | number | null,
  validation: Validation,
  label: string
): string | undefined {
  if (typeof value === 'string') {
    return `${label} must be a whole number`;
  }

  if (validation.isRequired && value === null) {
    return `${label} is required`;
  }
  if (typeof value === 'number') {
    if (value < validation.min) {
      return `${label} must be greater than or equal to ${validation.min}`;
    }
    if (value > validation.max) {
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

export const controller = (
  config: FieldControllerConfig<{ validation: Validation }>
): FieldController<string | number | null, string> & { validation: Validation } => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: null,
    deserialize: data => data[config.path],
    serialize: value => ({ [config.path]: value }),

    validate: value => validate(value, config.fieldMeta.validation, config.label) === undefined,
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
