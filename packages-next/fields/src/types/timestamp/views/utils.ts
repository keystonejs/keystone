import { parseISO, parse, isValid, formatISO } from 'date-fns';
import { DateType } from '@keystone-ui/fields';

const getTime = (timeValue: string) => {
  if (!timeValue) return [0, 0];
  return timeValue.split(':').map(n => Number(n));
};

export function isValidDate(date: DateType) {
  if (!date) return false;
  return Boolean(parseISO(date).toISOString());
}

export function isValidTime(time: string) {
  if (!time) {
    return false;
  }
  return isValid(parse(time, 'HH:mm', new Date()));
}

export function isValidISO(value: { dateValue: DateType; timeValue: string }) {
  try {
    // toISOString converts our string into zulu time
    // instead of checking for the timestamp to be specifically in zulu time
    // we relax the validation here a little, to just be a valid ISO string.

    return Boolean(parseISO(constructTimestamp(value)).toISOString());
  } catch (err) {
    return false;
  }
}

export function constructTimestamp({
  dateValue,
  timeValue,
}: {
  dateValue: string;
  timeValue: string;
}) {
  let formattedDate = new Date(dateValue);

  const [hours, minutes] = getTime(timeValue);
  formattedDate.setHours(hours);
  formattedDate.setMinutes(minutes);
  return formatISO(formattedDate);
}

export function deconstructTimestamp(value: string) {
  return { dateValue: value, timeValue: resolveInitialTimeValue(value) };
}

export function formatOutput(value: string) {
  if (!value) return '';
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export function resolveInitialTimeValue(value?: string, defaultValue?: string) {
  const date = value || defaultValue;
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
