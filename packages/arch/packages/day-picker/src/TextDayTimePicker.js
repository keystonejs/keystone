// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect, useRef } from 'react';
import chrono from 'chrono-node';
import { Input } from '@arch-ui/input';
import moment from 'moment';

// we use a string here instead of a Date because we want to encode the offset in the date
// (native JS Dates don't store offsets, they are based on the timezone of the user)
// and rather than exposing the object we're using the represent the date(in this case a moment object since that's what chrono uses)
// we're using a string so that we can change the underlying implementation without changing
// the API
// this proposal https://github.com/tc39/proposal-temporal looks really nice
// and would probably be a great thing to use here when it's stage 3(with a polyfill ofc)
type Props = {
  date: string | null,
  onChange: (string | null) => mixed,
};

export let TextDayTimePicker = ({ date, onChange, ...props }: Props) => {
  let [value, setValue] = useState('');
  let ref = useRef(null);

  useEffect(
    () => {
      setValue(formatDateTime(date));
    },
    [date]
  );

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
  return date === null ? '' : moment.parseZone(date).format('h:mm A Do MMMM YYYY Z');
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
