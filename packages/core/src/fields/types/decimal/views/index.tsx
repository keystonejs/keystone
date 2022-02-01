/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { Decimal } from 'decimal.js';
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

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const [hasBlurred, setHasBlurred] = useState(false);
  const inputProps = useFormattedInput<Decimal | null>(
    {
      format(decimal) {
        if (decimal === null) {
          return '';
        }

        return decimal.toFixed(field.scale);
      },
      parse(value) {
        value = value.trim();
        if (value === '') {
          return null;
        }
        let decimal: Decimal;
        try {
          decimal = new Decimal(value);
        } catch (err) {
          return value;
        }
        return decimal;
      },
    },
    {
      onChange(val) {
        onChange?.({ ...value, value: val });
      },
      value: value.value,
      onBlur() {
        setHasBlurred(true);
      },
    }
  );
  const validationMessage = validate(value, field.validation, field.label);
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      {onChange ? (
        <TextInput id={field.path} autoFocus={autoFocus} {...inputProps} />
      ) : (
        value.value?.toString()
      )}
      {(hasBlurred || forceValidation) && validationMessage && (
        <span css={{ color: 'red' }}>{validationMessage}</span>
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

export type DecimalFieldMeta = {
  precision: number;
  scale: number;
  defaultValue: string | null;
  validation: {
    isRequired: boolean;
    max: string | null;
    min: string | null;
  };
};

type Config = FieldControllerConfig<DecimalFieldMeta>;

type Validation = {
  isRequired: boolean;
  max: Decimal | null;
  min: Decimal | null;
};

type InnerValue = string | Decimal | null;

type Value =
  | {
      kind: 'create';
      value: InnerValue;
    }
  | {
      kind: 'update';
      initial: InnerValue;
      value: InnerValue;
    };

function validate(value: Value, validation: Validation, label: string): string | undefined {
  const val = value.value;
  if (typeof val === 'string') {
    return `${label} must be a number`;
  }

  // if we recieve null initially on the item view and the current value is null,
  // we should always allow saving it because:
  // - the value might be null in the database and we don't want to prevent saving the whole item because of that
  // - we might have null because of an access control error
  if (value.kind === 'update' && value.initial === null && val === null) {
    return undefined;
  }

  if (val !== null && !val.isFinite()) {
    return `${label} must be finite`;
  }

  if (validation.isRequired && val === null) {
    return `${label} is required`;
  }
  if (val !== null) {
    if (validation.min !== null && val.lessThan(validation.min)) {
      return `${label} must be greater than or equal to ${validation.min}`;
    }
    if (validation.max !== null && val.greaterThan(validation.max)) {
      return `${label} must be less than or equal to ${validation.max}`;
    }
  }

  return undefined;
}

export const controller = (
  config: Config
): FieldController<Value, string> & { scale: number; validation: Validation } => {
  const _validation = config.fieldMeta.validation;
  const validation: Validation = {
    isRequired: _validation.isRequired,
    max: _validation.max === null ? null : new Decimal(_validation.max),
    min: _validation.min === null ? null : new Decimal(_validation.min),
  };
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    scale: config.fieldMeta.scale,
    validation,
    defaultValue: {
      kind: 'create',
      value:
        config.fieldMeta.defaultValue === null ? null : new Decimal(config.fieldMeta.defaultValue),
    },
    deserialize: data => {
      const value = data[config.path] === null ? null : new Decimal(data[config.path]);
      return {
        kind: 'update',
        initial: value,
        value,
      };
    },
    serialize: value => ({
      [config.path]:
        value.value === null
          ? null
          : typeof value.value === 'string'
          ? value.value
          : value.value.toFixed(config.fieldMeta.scale),
    }),
    validate: val => validate(val, validation, config.label) === undefined,
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
            ? valueWithoutWhitespace.split(',')
            : valueWithoutWhitespace;
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
