/* @jsx jsx */
import { jsx, Stack, useTheme } from '@keystone-ui/core';
import { Checkbox, FieldContainer, FieldLabel, TextArea, TextInput } from '@keystone-ui/fields';
import { Fragment, useState } from 'react';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '../../../../types';
import { CellContainer, CellLink } from '../../../../admin-ui/components';

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const { typography, fields } = useTheme();
  const [shouldShowErrors, setShouldShowErrors] = useState(false);
  const validationMessages = value.kind === 'null' ? [] : validate(value.value, field.validation);
  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      {onChange ? (
        <Stack gap="small">
          {field.displayMode === 'textarea' ? (
            <TextArea
              id={field.path}
              autoFocus={autoFocus}
              onChange={event => onChange({ kind: 'value', value: event.target.value })}
              value={value.kind === 'null' ? '' : value.value}
              disabled={value.kind === 'null'}
              onBlur={() => {
                setShouldShowErrors(true);
              }}
            />
          ) : (
            <TextInput
              id={field.path}
              autoFocus={autoFocus}
              onChange={event => onChange({ kind: 'value', value: event.target.value })}
              value={value.kind === 'null' ? '' : value.value}
              disabled={value.kind === 'null'}
              onBlur={() => {
                setShouldShowErrors(true);
              }}
            />
          )}
          {field.isNullable && (
            <Checkbox
              autoFocus={autoFocus}
              disabled={onChange === undefined}
              onChange={() => {
                if (value.kind === 'value') {
                  onChange({
                    kind: 'null',
                    prev: value.value,
                  });
                } else {
                  onChange({
                    kind: 'value',
                    value: value.prev,
                  });
                }
              }}
              checked={value.kind === 'null'}
            >
              <span css={{ fontWeight: typography.fontWeight.semibold, color: fields.labelColor }}>
                Set field as null
              </span>
            </Checkbox>
          )}
          {!!validationMessages.length &&
            (shouldShowErrors || forceValidation) &&
            validationMessages.map((message, i) => (
              <span key={i} css={{ color: 'red' }}>
                {field.label} {message}
              </span>
            ))}
        </Stack>
      ) : (
        value
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

type Config = FieldControllerConfig<import('..').TextFieldMeta>;

type Validation = {
  match: { regex: RegExp; explanation: string | null } | null;
  length: { min: number | null; max: number | null };
};

function validate(val: string, validation: Validation): string[] {
  let messages: string[] = [];
  if (validation.length.min !== null && val.length < validation.length.min) {
    messages.push(`must be at least ${validation.length.min} characters long`);
  }
  if (validation.length.max !== null && val.length > validation.length.max) {
    messages.push(`must be no longer than ${validation.length.min} characters`);
  }
  console.log(validation.match);
  if (validation.match && !validation.match.regex.test(val)) {
    messages.push(validation.match.explanation || `must match ${validation.match.regex}`);
  }
  return messages;
}

type TextValue = { kind: 'null'; prev: string } | { kind: 'value'; value: string };

function deserializeTextValue(value: string | null): TextValue {
  if (value === null) {
    return { kind: 'null', prev: '' };
  }
  return { kind: 'value', value };
}

export const controller = (
  config: Config
): FieldController<TextValue, string> & {
  displayMode: 'input' | 'textarea';
  validation: Validation;
  isNullable: boolean;
} => {
  const validation: Validation = {
    length: config.fieldMeta.validation.length,
    match: config.fieldMeta.validation.match
      ? {
          regex: new RegExp(
            config.fieldMeta.validation.match.regex.source,
            config.fieldMeta.validation.match.regex.flags
          ),
          explanation: config.fieldMeta.validation.match.explanation,
        }
      : null,
  };
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: deserializeTextValue(config.fieldMeta.defaultValue),
    displayMode: config.fieldMeta.displayMode,
    isNullable: config.fieldMeta.isNullable,
    deserialize: data => deserializeTextValue(data[config.path]),
    serialize: value => ({ [config.path]: value.kind === 'null' ? null : value.value }),
    validation,
    validate: val => val.kind === 'null' || validate(val.value, validation).length === 0,
    filter: {
      Filter(props) {
        return (
          <TextInput
            onChange={event => {
              props.onChange(event.target.value);
            }}
            value={props.value}
            autoFocus={props.autoFocus}
          />
        );
      },

      graphql: ({ type, value }) => {
        const isNot = type.startsWith('not_');
        const key =
          type === 'is_i' || type === 'not_i'
            ? 'equals'
            : type
                .replace(/_i$/, '')
                .replace('not_', '')
                .replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
        const filter = { [key]: value };
        return {
          [config.path]: {
            ...(isNot ? { not: filter } : filter),
            mode: config.fieldMeta.shouldUseModeInsensitive ? 'insensitive' : undefined,
          },
        };
      },
      Label({ label, value }) {
        return `${label.toLowerCase()}: "${value}"`;
      },
      types: {
        contains_i: {
          label: 'Contains',
          initialValue: '',
        },
        not_contains_i: {
          label: 'Does not contain',
          initialValue: '',
        },
        is_i: {
          label: 'Is exactly',
          initialValue: '',
        },
        not_i: {
          label: 'Is not exactly',
          initialValue: '',
        },
        starts_with_i: {
          label: 'Starts with',
          initialValue: '',
        },
        not_starts_with_i: {
          label: 'Does not start with',
          initialValue: '',
        },
        ends_with_i: {
          label: 'Ends with',
          initialValue: '',
        },
        not_ends_with_i: {
          label: 'Does not end with',
          initialValue: '',
        },
      },
    },
  };
};
