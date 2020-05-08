import * as React from 'react';
import { parseISO } from 'date-fns';
import { DayPicker } from './DayPicker';
import { Input } from '@arch-ui/input';
import Select from '@arch-ui/select';

const options = [
  '-12',
  '-11',
  '-10',
  '-09',
  '-08',
  '-07',
  '-06',
  '-05',
  '-04',
  '-03',
  '-02',
  '-01',
  '+00',
  '+01',
  '+02',
  '+03',
  '+04',
  '+05',
  '+06',
  '+07',
  '+08',
  '+09',
  '+10',
  '+11',
  '+12',
  '+13',
  '+14',
].map(o => ({
  value: `${o}:00`,
  label: `${o}:00`,
}));

export const DayTimePicker = props => {
  const { date, time, offset, htmlID, autoFocus, isDisabled } = props;
  const {
    handleDayChange,
    handleTimeChange,
    handleOffsetChange,
    yearRangeFrom,
    yearRangeTo,
    yearPickerType,
  } = props;
  const TODAY = new Date();
  return (
    <div id={htmlID}>
      <DayPicker
        autoFocus={autoFocus}
        onSelectedChange={handleDayChange}
        yearRangeFrom={yearRangeFrom}
        yearRangeTo={yearRangeTo}
        yearPickerType={yearPickerType}
        startCurrentDateAt={date ? parseISO(date) : TODAY}
        selectedDate={date ? parseISO(date) : null}
      />
      <Input
        type="time"
        name="time-picker"
        value={time}
        onChange={handleTimeChange}
        disabled={isDisabled || false}
        id={`${htmlID}-time`}
      />
      <Select
        value={options.find(option => option.value === offset)}
        options={options}
        onChange={({ value }) => {
          handleOffsetChange(value);
        }}
        id={`${htmlID}-offset`}
      />
    </div>
  );
};
