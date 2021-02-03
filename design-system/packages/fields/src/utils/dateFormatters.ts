import { format, formatISO } from 'date-fns';
import { DateType } from '../types';

/**
 * Un-formatted date for server side storage (ISO8601), like '2019-09-18'
 */
export const formatDateType = (date: Date): DateType => {
  return formatISO(date, { representation: 'date' });
};

/**
 * Format day, month, year, like "Dec 01 2010" as "12/01/2010"
 * Note, subject to localisation, such as Jan 02 2009, can read 02/01/2009.
 *
 * @usage formatDMY(new Date('2019-09-18T19:00:52')) => "09/18/2019"
 */
export const formatDMY = (date: Date): string => format(date, 'MM/dd/yyyy');
