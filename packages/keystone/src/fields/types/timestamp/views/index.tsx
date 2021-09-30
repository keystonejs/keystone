/** @jsxRuntime classic */
/** @jsx jsx */
import { useState } from 'react';

import { jsx, Inline, Stack, VisuallyHidden } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput, DatePicker, DateType } from '@keystone-ui/fields';
import { TextInputProps } from '@keystone-ui/fields/src/TextInput';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '../../../../types';
import { CellContainer, CellLink } from '../../../../admin-ui/components';
import { useFormattedInput } from '../../integer/views/utils';
import {
  constructTimestamp,
  deconstructTimestamp,
  formatOutput,
  Value,
  parseTime,
  formatTime,
} from './utils';

// TODO: Bring across the datetime/datetimeUtc interfaces, date picker, etc.
interface TimePickerProps extends TextInputProps {
  format: '12hr' | '24hr';
}

const TimePicker = ({
  id,
  autoFocus,
  onBlur,
  disabled,
  onChange,
  format = '24hr',
  value,
}: TimePickerProps) => {
  return (
    <TextInput
      id={id}
      autoFocus={autoFocus}
      maxLength={format === '24hr' ? 5 : 7}
      disabled={disabled}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={format === '24hr' ? '00:00' : '00:00am'}
      value={value}
    />
  );
};

export const Field = ({
  field,
  value,
  onChange,
  forceValidation,
}: FieldProps<typeof controller>) => {
  const [touchedFirstInput, setTouchedFirstInput] = useState(false);
  const [touchedSecondInput, setTouchedSecondInput] = useState(false);
  const showValidation = (touchedFirstInput && touchedSecondInput) || forceValidation;

  const showDateError = (dateValue: DateType) => {
    if (!dateValue) {
      return <div css={{ color: 'red' }}>Please select a date value.</div>;
    }
    return !isValidISODate(dateValue) && <div css={{ color: 'red' }}>Incorrect date value</div>;
  };

  const showTimeError = (timeValue: string) => {
    if (!timeValue) {
      return <div css={{ color: 'red' }}>Please select a time value.</div>;
    }
    return (
      !isValidTime(timeValue) && <div css={{ color: 'red' }}>Time must be in the form HH:mm</div>
    );
  };

  const timeInputProps = useFormattedInput<{ kind: 'parsed'; value: string | null }>(
    {
      format({ value }) {
        if (value === null) {
          return '';
        }
        return formatTime(value);
      },
      parse(value) {
        value = value.trim();
        if (value === '') {
          return { kind: 'parsed', value: null };
        }
        const parsed = parseTime(value);
        if (parsed !== undefined) {
          return { kind: 'parsed', value: parsed };
        }
        return value;
      },
    },
    {
      value: value.value.timeValue,
      onChange(timeValue) {
        onChange?.({
          ...value,
          value: { ...value.value, timeValue },
        });
      },
      onBlur() {
        setTouchedSecondInput(true);
      },
    }
  );

  return (
    <FieldContainer as="fieldset">
      <FieldLabel as="legend">{field.label}</FieldLabel>
      {onChange ? (
        <Stack>
          <Inline gap="small">
            <Stack>
              <DatePicker
                onUpdate={date => {
                  onChange({ ...value, value: { ...value.value, dateValue: date } });
                }}
                onClear={() => {
                  onChange({ ...value, value: { ...value.value, dateValue: null } });
                }}
                onBlur={() => setTouchedFirstInput(true)}
                value={value.value.dateValue ?? ''}
              />
              {showValidation && showDateError(value.value.dateValue)}
            </Stack>
            <Stack>
              <VisuallyHidden
                as="label"
                htmlFor={`${field.path}--time-input`}
              >{`${field.label} time field`}</VisuallyHidden>
              <TimePicker
                id={`${field.path}--time-input`}
                disabled={onChange === undefined}
                format="24hr"
                {...timeInputProps}
              />
              {showValidation && showTimeError(value.value.timeValue)}
            </Stack>
          </Inline>
        </Stack>
      ) : isValidISO(value) ? (
        formatOutput(constructTimestamp(value))
      ) : (
        ''
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

export const controller = (
  config: FieldControllerConfig<{ defaultValue: string | { kind: 'now' } | null }>
): FieldController<Value, string> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: {
      kind: 'create',
      value:
        typeof config.fieldMeta.defaultValue === 'string'
          ? deconstructTimestamp(config.fieldMeta.defaultValue)
          : { dateValue: null, timeValue: '' },
    },
    deserialize: data => {
      const value = data[config.path];
      return {
        kind: 'update',
        initial: data[config.path],
        value: value ? deconstructTimestamp(value) : { dateValue: null, timeValue: '' },
      };
    },
    serialize: ({ value: { dateValue, timeValue } }) => {
      if (dateValue && typeof timeValue === 'object' && timeValue.value !== null) {
        let formattedDate = constructTimestamp({ dateValue, timeValue });
        return { [config.path]: formattedDate };
      }
      return { [config.path]: null };
    },
    validate({ dateValue, timeValue }) {
      if (!dateValue && !timeValue) return true;
      if (!dateValue) return false;
      return isValidISO({ dateValue, timeValue });
    },
  };
};
