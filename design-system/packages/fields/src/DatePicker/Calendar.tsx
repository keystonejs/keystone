/** @jsx jsx */

import { useMemo } from 'react';
import DayPicker, { DayPickerProps } from 'react-day-picker';
import { jsx, useTheme } from '@keystone-ui/core';
import { getContrastText } from './utils/getContrastText';
import { hexToRgb } from './utils/hexToRgb';

export const Calendar = ({ modifiers, ...props }: DayPickerProps) => {
  const styles = useCalendarStyles();
  const indexOfMonday = 1;
  const augmentedModifiers = useMemo(
    () => ({
      ...modifiers,
      weekend: { daysOfWeek: [0, 6] },
    }),
    [modifiers]
  );

  return (
    <div css={styles}>
      <DayPicker firstDayOfWeek={indexOfMonday} modifiers={augmentedModifiers} {...props} />
    </div>
  );
};

// Styles
// ------------------------------

const useCalendarStyles = () => {
  const { colors, palette } = useTheme();
  const cellSize = 40; // theme.sizing.base;
  const navButtonSize = 24; // theme.sizing.xsmall;
  const interactionColor = '#007AFF'; //theme.palette.actions.active;
  const rangeBetweenColor = hexToRgb('#007AFF', 0.2); //hexToRgb(interactionColor, 0.2);

  return {
    padding: 8, //theme.spacing.small,

    // resets and wrapper stuff
    '.DayPicker': {
      display: 'inline-block',
      fontSize: '1rem',
    },
    '.DayPicker-wrapper': {
      position: 'relative',
      flexDirection: 'row',
      userSelect: 'none',
      outline: 0,
    },
    '.DayPicker-Months': {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    '.DayPicker-Month': {
      display: 'table',

      // separate weeks for easier parsing of range selection
      borderSpacing: '0 2px',
      borderCollapse: 'separate',

      // separate months for easier parsing of range selection
      margin: 8, // theme.spacing.small,

      // NOTE: resolve weird safari bug:
      // https://bugs.webkit.org/show_bug.cgi?id=187903
      position: 'relative',
      '.DayPicker-Caption > div': { position: 'absolute' },
    },

    // the caption is the day/month title e.g. "July 2020"
    '.DayPicker-Caption': {
      display: 'table-caption',
      height: navButtonSize,
      marginBottom: '0.5em',
      padding: '0 0.5em',
      textAlign: 'left',
    },
    '.DayPicker-Caption > div': {
      fontWeight: 500, //theme.typography.fontWeight.medium,
      fontSize: '1rem', //theme.typography.fontSize.medium,
    },

    // weekdays
    '.DayPicker-Weekdays': { display: 'table-header-group', marginTop: '1em' },
    '.DayPicker-WeekdaysRow': { display: 'table-row' },
    '.DayPicker-Weekday': {
      color: colors.foregroundDim, //theme.palette.text.dim,
      display: 'table-cell',
      fontSize: '0.875rem', //theme.typography.fontSize.small,
      fontWeight: 500, //theme.typography.fontWeight.medium,
      padding: '0.5em',
      textAlign: 'center',
    },
    '.DayPicker-Weekday abbr[title]': {
      borderBottom: 'none',
      textDecoration: 'none',
    },
    '.DayPicker-Body': {
      display: 'table-row-group',
      fontSize: '0.875rem', //theme.typography.fontSize.small,
      fontWeight: 500, // theme.typography.fontWeight.medium,
    },
    '.DayPicker-Week': { display: 'table-row' },
    '.DayPicker-WeekNumber': {
      display: 'table-cell',
      padding: '0.5em',
      minWidth: '1em',
      borderRight: '1px solid #EAECEC',
      color: colors.foregroundDim, //theme.palette.text.dim,
      verticalAlign: 'middle',
      textAlign: 'right',
      fontSize: '0.75em',
      cursor: 'pointer',
    },
    '.DayPicker--interactionDisabled .DayPicker-Day': { cursor: 'default' },

    // nav buttons
    '.DayPicker-NavBar': {
      display: 'flex',
      position: 'absolute',
      right: 4, //theme.spacing.xsmall,
      top: 4, //theme.spacing.xsmall,
      zIndex: 1,
    },
    '.DayPicker-NavButton': {
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      // backgroundSize: '66.667%',
      borderRadius: 4, //theme.radii.xsmall,
      color: colors.foreground, // theme.palette.listItem.text,
      cursor: 'pointer',
      display: 'inline-block',
      height: 32, //theme.sizing.small,
      left: 'auto',
      width: 32, //theme.sizing.small,

      ':hover, &.focus-visible': {
        backgroundColor: 'grey', // theme.palette.listItem.backgroundFocused,
        color: colors.foreground, // theme.palette.listItem.textFocused,
        outline: 0,
      },
      ':active': {
        backgroundColor: 'grey', //theme.palette.listItem.backgroundPressed,
        color: colors.foreground, //theme.palette.listItem.textPressed,
      },
    },
    '.DayPicker-NavButton--next': {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' stroke='${encodeURIComponent(
        colors.foreground //theme.palette.listItem.text
      )}' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' %3E%3Cpolyline points='9 18 15 12 9 6'%3E%3C/polyline%3E%3C/svg%3E")` as string,
    },
    '.DayPicker-NavButton--prev': {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24' stroke='${encodeURIComponent(
        colors.foreground //theme.palette.listItem.text
      )}' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round' %3E%3Cpolyline points='15 18 9 12 15 6'%3E%3C/polyline%3E%3C/svg%3E")` as string,
    },

    // "day" or grid cell
    '.DayPicker-Day--outside': {
      color: colors.foregroundDim, // theme.palette.text.dim,
      cursor: 'default',
    },
    '.DayPicker-Day--disabled': {
      color: colors.foregroundDim, // theme.palette.text.dim,
      cursor: 'default',
    },

    '.DayPicker-Day': {
      borderRadius: '50%',
      display: 'table-cell',
      height: cellSize,
      outline: 0, // we handle focus below, with box-shadow
      padding: 0,
      position: 'relative',
      textAlign: 'center',
      verticalAlign: 'middle',
      width: cellSize,
    },
    '.DayPicker-Day--weekend': {
      color: colors.foregroundMuted, // theme.palette.text.muted,
    },
    '.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)': {
      cursor: 'pointer',

      '&:hover, &.focus-visible': {
        // backgroundColor: 'transparent',
        outline: 0,

        '&::after': {
          borderRadius: '50%',
          boxShadow: `inset 0 0 0 2px ${interactionColor}`,
          content: '" "',
          height: cellSize,
          left: 0,
          position: 'absolute',
          top: 0,
          width: cellSize,
        },
      },
    },
    '.DayPicker-Day--today': {
      color: palette.red400, // theme.palette.text.critical,
      fontWeight: 700, // theme.typography.fontWeight.bold,
    },
    '.DayPicker-Day--selected:not(.DayPicker-Day--outside)': {
      color: getContrastText(interactionColor),

      '&, &:hover, &.focus-visible': {
        backgroundColor: interactionColor,
      },
    },

    // range-specific day styles
    '.DayPicker-Day--rangeStart:not(.DayPicker-Day--outside), .DayPicker-Day--rangeEnd:not(.DayPicker-Day--outside)': {
      '&::before': {
        backgroundColor: rangeBetweenColor,
        position: 'absolute',
        content: '" "',
        width: cellSize / 2,
        height: cellSize,
        top: 0,
        zIndex: -1,
      },
    },
    '.DayPicker-Day--rangeStart': {
      '&::before': {
        right: 0,
      },
    },
    '.DayPicker-Day--rangeEnd': {
      '&::before': {
        left: 0,
      },
    },
    '.DayPicker-Day--rangeBetween.DayPicker-Day--selected:not(.DayPicker-Day--outside)': {
      '&, &:hover, &.focus-visible': {
        backgroundColor: rangeBetweenColor,
        borderRadius: 0,
        color: colors.foreground, // theme.palette.text.base,
      },
    },
    '.DayPicker-Day--rangeBetween.DayPicker-Day--firstOfMonth:not(.DayPicker-Day--outside)': {
      '&, &:hover, &.focus-visible': {
        // background: `linear-gradient(to left, ${rangeBetweenColor}, ${theme.palette.background.dialog})`,
        background: `linear-gradient(to left, ${rangeBetweenColor}, ${colors.overlayBackground})`,
      },
    },
    '.DayPicker-Day--rangeBetween.DayPicker-Day--lastOfMonth:not(.DayPicker-Day--outside)': {
      '&, &:hover, &.focus-visible': {
        // background: `linear-gradient(to right, ${rangeBetweenColor}, ${theme.palette.background.dialog})`,
        background: `linear-gradient(to right, ${rangeBetweenColor}, ${colors.overlayBackground})`,
      },
    },
  } as const;
};
