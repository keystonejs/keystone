import { format, isFuture } from 'date-fns';

// Check if date is in future or past
export const isInFuture = date => isFuture(date);

// Pretty date formatting
export const formatFutureDate = date => format(date, 'ddd D MMM, h:mm A');
export const formatPastDate = date => format(date, 'MMM YYYY');
