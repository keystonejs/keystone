import { DateTime } from 'luxon';

export function parseDate(value) {
  // why do we use luxon instead of date-fns/native Dates?
  // native Dates don't allow you to set custom timezones
  // yes, you can parse other timezones but they're converted
  // to the local time zone

  const dt = DateTime.fromISO(value, { setZone: true });

  return {
    date: dt.toFormat('yyyy-LL-dd'),
    time: dt.toFormat('HH:mm:ss.SSS'),
    offset: dt.toFormat('ZZ'),
  };
}

export function stringifyDate(date) {
  return `${date.date}T${date.time}${date.offset}`;
}
