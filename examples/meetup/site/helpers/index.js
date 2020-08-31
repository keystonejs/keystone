import { useEffect } from 'react';
import { format, parseISO, isFuture } from 'date-fns';
import getConfig from 'next/config';
import contrast from 'get-contrast';

import { colors } from '../theme';

const {
  publicRuntimeConfig: { meetup },
} = getConfig();

// Check if date is in future or past
export const isInFuture = date => isFuture(parseISO(date));

// Pretty date formatting
export const formatFutureDate = date => format(parseISO(date), 'iii d MMM, h:mm a');
export const formatPastDate = date => format(parseISO(date), 'LLL yyyy');

// Singular / Plural
export const pluralLabel = (num, single, plural) => {
  return num === 1 ? `${num} ${single}` : `${num} ${plural}`;
};

// Get A11Y contrast-compliant foreground color from background color
export const getForegroundColor = backgroundColor => {
  const darkFgScore = contrast.ratio(colors.greyDark, backgroundColor);
  const lightFgScore = contrast.ratio('white', backgroundColor);

  return darkFgScore - lightFgScore > 1 ? colors.greyDark : 'white';
};

// ==============================
// Hooks
// ==============================

// Logo dimensions
export const useLogoDimension = () => {
  const logoWidth = meetup.logo.width;
  const logoHeight = meetup.logo.height;
  const logoWidthSm = logoWidth / 1.5;
  const logoHeightSm = logoHeight / 1.5;

  return { logoWidth, logoHeight, logoWidthSm, logoHeightSm };
};

// Key handling
export function useKeydown(key, callback) {
  useEffect(() => {
    const handler = function(event) {
      if (event.key === key) {
        callback();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, []);
}

// Strip Tags
export const stripTags = htmlString => {
  return (htmlString || '').replace(/(<([^>]+)>)/gi, '');
};
