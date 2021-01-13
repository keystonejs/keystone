/* @jsx jsx */
import { useState } from 'react';
import {
  isValidDate,
  isValidISO,
  isValidTime,
  constructTimestamp,
  deconstructTimestamp,
  formatOutput,
} from './utils';

import { CellContainer, CellLink } from '@keystone-next/admin-ui/components';
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from '@keystone-next/types';
import { jsx, Inline, Stack } from '@keystone-ui/core';
import { FieldContainer, FieldLabel, TextInput, DatePicker, DateType } from '@keystone-ui/fields';
import { TextInputProps } from '@keystone-ui/fields/src/TextInput';

// TODO: Bring across the datetime/datetimeUtc interfaces, date picker, etc.
interface TimePickerProps extends TextInputProps {
  format: '12hr' | '24hr';
}

const TimePicker = ({
  autoFocus,
  onBlur,
  disabled,
  onChange,
  format = '24hr',
  value,
}: TimePickerProps) => {
  return (
    <TextInput
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
    return !isValidDate(dateValue) && <div css={{ color: 'red' }}>Incorrect date value</div>;
  };

  const showTimeError = (timeValue: string) => {
    if (!timeValue) {
      return <div css={{ color: 'red' }}>Please select a time value.</div>;
    }
    return (
      !isValidTime(timeValue) && <div css={{ color: 'red' }}>Time must be in the form HH:mm</div>
    );
  };

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {onChange ? (
        <Stack>
          <Inline gap="small">
            <Stack>
              <DatePicker
                onUpdate={date => {
                  onChange({ ...value, dateValue: date || '' });
                }}
                onClear={() => {
                  onChange({ ...value, dateValue: '' });
                }}
                onBlur={() => setTouchedFirstInput(true)}
                value={value.dateValue}
              />
              {showValidation && showDateError(value.dateValue)}
            </Stack>
            <Stack>
              <TimePicker
                onBlur={() => setTouchedSecondInput(true)}
                disabled={onChange === undefined}
                format="24hr"
                onChange={event => onChange({ ...value, timeValue: event.target.value })}
                value={value.timeValue || ''}
              />
              {showValidation && showTimeError(value.timeValue)}
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
  config: FieldControllerConfig
): FieldController<{ dateValue: string; timeValue: string }, string> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: { dateValue: '', timeValue: '' },
    deserialize: data => {
      const value = data[config.path];
      if (value) {
        return deconstructTimestamp(value);
      }
      return { dateValue: '', timeValue: '' };
    },
    serialize: ({ dateValue, timeValue }) => {
      if (dateValue && timeValue && isValidISO({ dateValue, timeValue })) {
        let formattedDate = constructTimestamp({ dateValue, timeValue });
        return { [config.path]: formattedDate };
      }
      return { [config.path]: null };
    },
    validate({ dateValue, timeValue }) {
      if (!dateValue && !timeValue) return true;
      if (!dateValue) return false;
      if (!timeValue) return false;
      return isValidISO({ dateValue, timeValue });
    },
  };
};
