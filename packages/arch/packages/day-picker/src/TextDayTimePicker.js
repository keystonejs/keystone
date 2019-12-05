/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useRef } from 'react';
import chrono from 'chrono-node';
import { Input } from '@arch-ui/input';
import moment from 'moment';

export let TextDayTimePicker = ({ date, onChange, ...props }) => {
  let [value, setValue] = useState('');
  let ref = useRef(null);

  useEffect(() => {
    setValue(formatDateTime(date));
  }, [date]);

  return (
    <Input
      value={value}
      ref={ref}
      placeholder="Enter a date and time..."
      onBlur={() => {
        let parsedDate = parseDate(value);
        onChange(parsedDate);
        setValue(formatDateTime(parsedDate));
      }}
      onChange={event => {
        setValue(event.target.value);
      }}
      {...props}
    />
  );
};

function formatDateTime(date) {
  // why are we using moment when it's so large and provides a mutable API?
  // because chrono uses it and consistency is nice and
  // will probably make bugs with conversion less likely
  return date ? moment.parseZone(date).format('h:mm A Do MMMM YYYY Z') : '';
}

function parseDate(value) {
  let [parsedDate] = chrono.parse(value);
  if (parsedDate === undefined) {
    return null;
  }
  let dateMoment = parsedDateToMoment(parsedDate);
  return dateMoment.toISOString(
    // passing true here keeps the offset in the iso string rather than
    // convert it to UTC which is the default to align with native JS Dates
    true
  );
}

function parsedDateToMoment(parsedDate) {
  // a copy of https://github.com/wanasit/chrono/blob/fe8db4e5e5f9b44215f96958c811f806458013e9/src/result.js#L102-L122
  // with one change, rather than adjusting the time to the timezone offset, we store the offset

  let dateMoment = moment();
  let currentTimezoneOffset = moment().utcOffset();

  let { start } = parsedDate;

  dateMoment.set('year', start.get('year'));
  dateMoment.set('month', start.get('month') - 1);
  dateMoment.set('date', start.get('day'));
  dateMoment.set('hour', start.get('hour'));
  dateMoment.set('minute', start.get('minute'));
  dateMoment.set('second', start.get('second'));
  dateMoment.set('millisecond', start.get('millisecond'));
  let targetTimezoneOffset =
    start.get('timezoneOffset') !== undefined ? start.get('timezoneOffset') : currentTimezoneOffset;

  dateMoment.utcOffset(
    targetTimezoneOffset,
    // passing true keeps the local time the same but changes the universal time
    // this is what we want because we're setting the local time above
    true
  );
  return dateMoment;
}
