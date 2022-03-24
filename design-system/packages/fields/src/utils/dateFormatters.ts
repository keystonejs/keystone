import { formatISO, parse } from 'date-fns';
import { DateType } from '../types';

/**
 * Un-formatted date for server side storage (ISO8601), like '2019-09-18'
 */
export const formatDateType = (date: Date): DateType => {
  return formatISO(date, { representation: 'date' });
};

export const deserializeDate = (date: string): Date => {
  return parse(date, 'yyyy-MM-dd', new Date());
};

// undefined means we'll use the user's locale
const formatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const formatDate = (date: Date): string => formatter.format(date);

export const dateFormatPlaceholder = formatter
  .formatToParts(new Date())
  .map(x => {
    if (x.type === 'day') {
      return 'dd';
    }
    if (x.type === 'month') {
      return 'mm';
    }
    if (x.type === 'year') {
      return 'yyyy';
    }
    return x.value;
  })
  .join('');
