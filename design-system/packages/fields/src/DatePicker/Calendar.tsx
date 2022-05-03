/** @jsxRuntime classic */
/** @jsx jsx */

import { DayPicker, DayPickerProps } from 'react-day-picker';
import { jsx, useTheme } from '@keystone-ui/core';
import { getContrastText } from './utils/getContrastText';
import { hexToRgb } from './utils/hexToRgb';

export const Calendar = ({ modifiers, ...props }: DayPickerProps) => {
  const styles = useCalendarStyles();
  const indexOfMonday = 1;

  return (
    <div css={styles}>
      <DayPicker weekStartsOn={indexOfMonday} {...props} />
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
    '.rdp': {
      display: 'inline-block',
      fontSize: '1rem',
    },
    '.rdp-vhidden': {
      boxSizing: 'border-box',
      padding: 0,
      margin: 0,
      background: 'transparent',
      border: 0,
      MozAppearance: 'none',
      WebkitAppearance: 'none',
      appearance: 'none',
      top: 0,
      width: '1px !important',
      height: '1px !important',
      overflow: 'hidden !important',
      clip: 'rect(1px, 1px, 1px, 1px) !important',
      display: 'block !important',
    },
    '.rdp-wrapper': {
      position: 'relative',
      flexDirection: 'row',
      userSelect: 'none',
      outline: 0,
    },
    '.rdp-months': {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    '.rdp-month': {
      display: 'table',

      // separate weeks for easier parsing of range selection
      borderSpacing: '0 2px',
      borderCollapse: 'separate',

      // separate months for easier parsing of range selection
      margin: 8, // theme.spacing.small,

      // NOTE: resolve weird safari bug:
      // https://bugs.webkit.org/show_bug.cgi?id=187903
      position: 'relative',
      '.rdp-caption_label': { position: 'absolute' },
    },

    // the caption is the day/month title e.g. "July 2020"
    '.rdp-caption': {
      display: 'flex',
      height: navButtonSize,
      marginBottom: '0.5em',
      padding: '0 0.5em',
      textAlign: 'left',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    '.rdp-caption_label': {
      fontWeight: 500, //theme.typography.fontWeight.medium,
      fontSize: '1rem', //theme.typography.fontSize.medium,
    },

    // weekdays
    '.rdp-head': { display: 'table-header-group', marginTop: '1em' },
    '.rdp-head_row': { display: 'table-row' },
    '.rdp-head_cell': {
      color: colors.foregroundDim, //theme.palette.text.dim,
      display: 'table-cell',
      fontSize: '0.875rem', //theme.typography.fontSize.small,
      fontWeight: 500, //theme.typography.fontWeight.medium,
      padding: '0.5em',
      textAlign: 'center',
    },
    '.rdp-head_cell abbr[title]': {
      borderBottom: 'none',
      textDecoration: 'none',
    },
    '.rdp-body': {
      display: 'table-row-group',
      fontSize: '0.875rem', //theme.typography.fontSize.small,
      fontWeight: 500, // theme.typography.fontWeight.medium,
    },
    '.rdp-week': { display: 'table-row' },
    '.rdp-weeknumber': {
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
    '.rdp_interactionDisabled .rdp-day': { cursor: 'default' },

    // nav buttons
    '.rdp-nav': {
      position: 'absolute',
      right: 4, //theme.spacing.xsmall,
      zIndex: 1,
    },
    '.rdp-nav_button': {
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'transparent',
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

    // "day" or grid cell
    '.rdp-day_outside': {
      color: colors.foregroundDim, // theme.palette.text.dim,
      cursor: 'default',
    },
    '.rdp-day_disabled': {
      color: colors.foregroundDim, // theme.palette.text.dim,
      cursor: 'default',
    },

    '.rdp-day': {
      borderRadius: '50%',
      display: 'table-cell',
      height: cellSize,
      outline: 0, // we handle focus below, with box-shadow
      padding: 0,
      position: 'relative',
      textAlign: 'center',
      verticalAlign: 'middle',
      width: cellSize,
      backgroundColor: 'transparent',
    },
    '.rdp-day_weekend': {
      color: colors.foregroundMuted, // theme.palette.text.muted,
    },
    '.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside)': {
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
    '.rdp-day_today': {
      color: palette.red400, // theme.palette.text.critical,
      fontWeight: 700, // theme.typography.fontWeight.bold,
    },
    '.rdp-day_selected:not(.rdp-day_outside)': {
      color: getContrastText(interactionColor),

      '&, &:hover, &.focus-visible': {
        backgroundColor: interactionColor,
      },
    },

    // range-specific day styles
    '.rdp-day_range_start:not(.rdp-day_outside), .rdp-day_range_end:not(.rdp-day_outside)': {
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
    '.rdp-day_range_start': {
      '&::before': {
        right: 0,
      },
    },
    '.rdp-day_range_end': {
      '&::before': {
        left: 0,
      },
    },
    '.rdp-day_range_between.rdp-day_selected:not(.rdp-day_outside)': {
      '&, &:hover, &.focus-visible': {
        backgroundColor: rangeBetweenColor,
        borderRadius: 0,
        color: colors.foreground, // theme.palette.text.base,
      },
    },
    '.rdp-day_rangeBetween.rdp-day_firstOfMonth:not(.rdp-day_outside)': {
      '&, &:hover, &.focus-visible': {
        // background: `linear-gradient(to left, ${rangeBetweenColor}, ${theme.palette.background.dialog})`,
        background: `linear-gradient(to left, ${rangeBetweenColor}, ${colors.overlayBackground})`,
      },
    },
    '.rdp-day_rangeBetween.rdp-day_lastOfMonth:not(.rdp-day_outside)': {
      '&, &:hover, &.focus-visible': {
        // background: `linear-gradient(to right, ${rangeBetweenColor}, ${theme.palette.background.dialog})`,
        background: `linear-gradient(to right, ${rangeBetweenColor}, ${colors.overlayBackground})`,
      },
    },
  } as const;
};
