import { format, isFuture } from 'date-fns';
import { breakpoints } from '../theme';

// Check if date is in future or past
export const isInFuture = date => isFuture(date);

// Pretty date formatting
export const formatFutureDate = date => format(date, 'ddd D MMM, h:mm A');
export const formatPastDate = date => format(date, 'MMM YYYY');

// Media queries getter
export const getBreakpoints = () => {
  return Object.values(breakpoints).map(bp => `@media (min-width: ${bp}px)`);
};

// Singular / Plural
export const pluralLabel = (num, single, plural) => {
  return num === 1 ? `${num} ${single}` : `${num} ${plural}`;
};
