import { format, isFuture } from 'date-fns';
import contrast from 'get-contrast';
import { colors } from '../theme';

// Check if date is in future or past
export const isInFuture = date => isFuture(date);

// Pretty date formatting
export const formatFutureDate = date => format(date, 'ddd D MMM, h:mm A');
export const formatPastDate = date => format(date, 'MMM YYYY');

// Singular / Plural
export const pluralLabel = (num, single, plural) => {
  return num === 1 ? `${num} ${single}` : `${num} ${plural}`;
};

// Get A11Y contrast-compliant foreground color from background color
export const getForegroundColor = (backgroundColor) => {
  const darkFgScore = contrast.ratio(colors.greyDark, backgroundColor);
  const lightFgScore = contrast.ratio('white', backgroundColor);

  return (darkFgScore - lightFgScore) > 1 ? colors.greyDark : 'white';
};
