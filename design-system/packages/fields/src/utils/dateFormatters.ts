import { format, formatISO } from 'date-fns';
import { DateType } from '../../types';

/**
 * Un-formatted date for server side storage (ISO8601), like '2019-09-18T19:00:52'
 */
export const formatDateType = (date: Date): DateType => {
  return formatISO(date);
};

/**
 * Format day, month, year, like "Dec 01 2010" as "12/01/2010"
 * Note, subject to localisation, such as Jan 02 2009, can read 02/01/2009.
 *
 * @usage formatDMY(new Date('2019-09-18T19:00:52')) => "09/18/2019"
 */
export const formatDMY = (date: Date): string => format(date, 'MM/dd/yyyy');

/**
 * Format day, month, year as human readable, like "Dec 01 2010" as "1 Dec 2010"
 */
export const formatDMYHumanised = (date: Date): string => format(date, 'd LLL yyyy');

/**
 * Format day, month, year with time, like "Dec 01 2010 22:42:13" as "12/01/2010, 10:42 PM"
 */
export const formatDMYTime = (date: Date): string => format(date, 'MM/dd/yyyy, p');

/**
 * Format day, month, year with time, like "Dec 01 2010 22:42:13" as "12 Dec 2010, 10:42 PM"
 */
export const formatDMYTimeHumanised = (date: Date): string => format(date, 'd LLL yyyy, p');

/**
 * Format time, like "Dec 01 2010 22:42:13" as "10:42 PM"
 */
export const formatTime = (date: Date): string => format(date, 'p');
