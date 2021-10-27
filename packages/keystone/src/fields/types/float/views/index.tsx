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
import { useFormattedInput } from '../../integer/views/utils';

type Validation = {
  min?: number;
  max?: number;
  isRequired?: boolean;
};

type Value =
  | { kind: 'update'; initial: number | null; value: string | number | null }
  | { kind: 'create'; value: string | number | null };

function validate(value: Value, validation: Validation, label: string) {
  const val = value.value;

  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === 'update' && value.initial === null && val === null) {
    return undefined;
  }

  if (value.kind === 'create' && value.value === null) {
    return undefined;
  }

  if (validation.isRequired && val === null) {
    return `${label} is required`;
  }

  // we don't parse infinite numbers into +-Infinity/NaN so that we don't lose the text that the user wrote
  // so we need to try parsing it again here to provide good messages
  if (typeof val === 'string') {
    const number = parseFloat(val);
    if (isNaN(number)) {
      return `${label} must be a number`;
    }
    return `${label} must be finite`;
  }

  if (typeof val === 'number') {
    if (typeof validation?.min === 'number' && val < validation.min) {
      return `${label} must be greater than or equal to ${validation.min}`;
    }
    if (typeof validation?.max === 'number' && val > validation?.max) {
      return `${label} must be less than or equal to ${validation.max}`;
    }
  }

  return undefined;
}

function FloatInput({
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
        let parsed = parseFloat(raw);
        if (Number.isFinite(parsed)) {
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
  const message = validate(value, field.validation, field.label);
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      {onChange ? (
        <span>
          <FloatInput
            id={field.path}
            autoFocus={autoFocus}
            onChange={val => {
              onChange({ ...value, value: val });
            }}
            value={value.value}
            forceValidation={forceValidation}
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
      {item[field.path]}
    </FieldContainer>
  );
};

export const controller = (
  config: FieldControllerConfig<{ validation: Validation; defaultValue: number | null }>
): FieldController<Value, string> & {
  validation: Validation;
} => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    validation: config.fieldMeta.validation,
    defaultValue: {
      kind: 'create',
      value: config.fieldMeta.defaultValue,
    },
    deserialize: data => ({
      kind: 'update',
      initial: data[config.path],
      value: data[config.path],
    }),
    serialize: value => ({ [config.path]: value.value }),
    validate: value => validate(value, config.fieldMeta.validation, config.label) === undefined,
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
        const valueWithoutWhitespace = value.replace(/\s/g, '');
        const parsed =
          type === 'in' || type === 'not_in'
            ? valueWithoutWhitespace.split(',').map(x => parseFloat(x))
            : parseFloat(valueWithoutWhitespace);
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
