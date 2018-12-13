// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { format } from 'date-fns';

import { FieldContainer, FieldLabel, FieldInput } from '@voussoir/ui/src/primitives/fields';
import { Button } from '@voussoir/ui/src/primitives/buttons';
import { DateTimePicker } from '@voussoir/ui/src/primitives/forms';
import { Popout } from '@voussoir/ui/src/primitives/modals';
import { gridSize } from '@voussoir/ui/src/theme';
import { parseDate, stringifyDate } from './utils';

type Props = {
  onChange: (field: Object, value: string | null) => mixed,
  autoFocus: boolean,
  field: Object,
  item: Object,
};

const CalendarDayField = ({ autoFocus, field, onChange, item }: Props) => {
  const value = item[field.path];
  const parsedDate = value ? parseDate(value) : { date: '', time: '', offset: '' };
  const defaultParsedDate = value ? parseDate(value) : parseDate(new Date().toISOString());

  let handleDayChange = day => {
    onChange(field, stringifyDate({ ...defaultParsedDate, date: format(day, 'YYYY-MM-DD') }));
  };

  let handleTimeChange = event => {
    onChange(field, stringifyDate({ ...defaultParsedDate, time: event.target.value }));
  };

  let handleOffsetChange = offset => {
    onChange(field, stringifyDate({ ...defaultParsedDate, offset }));
  };

  const { date, time, offset } = parsedDate;

  const htmlID = `ks-input-${field.path}`;
  const target = (
    <Button autoFocus={autoFocus} id={htmlID} variant="ghost">
      {value
        ? format(date + ' ' + time + offset, field.config.format || 'Do MMM YYYY')
        : 'Set Date & Time'}
    </Button>
  );

  return (
    <FieldContainer>
      <FieldLabel htmlFor={htmlID}>{field.label}</FieldLabel>
      <FieldInput>
        <Popout target={target} width={280}>
          <div css={{ padding: gridSize }}>
            <DateTimePicker
              {...{
                htmlID: htmlID + '-picker',
                date,
                time,
                offset,
                handleDayChange,
                handleTimeChange,
                handleOffsetChange,
                yearRangeFrom: field.config.yearRangeFrom,
                yearRangeTo: field.config.yearRangeTo,
                yearPickerType: field.config.yearPickerType,
              }}
            />
          </div>
        </Popout>
      </FieldInput>
    </FieldContainer>
  );
};

export default CalendarDayField;
