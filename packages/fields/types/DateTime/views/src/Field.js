// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { format } from 'date-fns';

import { FieldContainer, FieldLabel, FieldInput } from '@arch-ui/fields';
import { Button } from '@arch-ui/button';
import { DayTimePicker } from '@arch-ui/day-picker';
import Popout from '@arch-ui/popout';
import { gridSize } from '@arch-ui/theme';
import { parseDate, stringifyDate } from './utils';

type Props = {
  onChange: (value: string | null) => mixed,
  autoFocus: boolean,
  field: Object,
  value: string,
};

const CalendarDayField = ({ autoFocus, field, onChange, value }: Props) => {
  const parsedDate = value ? parseDate(value) : { date: '', time: '', offset: '' };
  const defaultDate = new Date();

  defaultDate.setUTCHours(0);
  defaultDate.setUTCMinutes(0);
  defaultDate.setUTCSeconds(0);
  defaultDate.setUTCMilliseconds(0);

  const defaultParsedDate = value ? parseDate(value) : parseDate(defaultDate.toISOString());

  let handleDayChange = day => {
    onChange(stringifyDate({ ...defaultParsedDate, date: format(day, 'YYYY-MM-DD') }));
  };

  let handleTimeChange = event => {
    onChange(stringifyDate({ ...defaultParsedDate, time: event.target.value }));
  };

  let handleOffsetChange = offset => {
    onChange(stringifyDate({ ...defaultParsedDate, offset }));
  };

  const { date, time, offset } = parsedDate;

  const htmlID = `ks-input-${field.path}`;
  const target = props => (
    <Button {...props} autoFocus={autoFocus} id={htmlID} variant="ghost">
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
            <DayTimePicker
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
