/** @jsxRuntime classic */
/** @jsx jsx */

import { DayPicker, type DayPickerProps } from '@daypicker/react'
import { jsx, useTheme } from '@keystone-ui/core'
import { getContrastText } from './utils/getContrastText'
import { hexToRgb } from './utils/hexToRgb'

export const Calendar = (props: DayPickerProps) => {
  const styles = useCalendarStyles()

  return (
    <div css={styles}>
      <DayPicker weekStartsOn={1} {...props} />
    </div>
  )
}

// Styles
// ------------------------------

const useCalendarStyles = () => {
  const { colors, palette } = useTheme()
  const cellSize = 40
  const navButtonSize = 32
  const interactionColor = '#007AFF'
  const rangeBetweenColor = hexToRgb(interactionColor, 0.2)

  return {
    padding: 8,

    '.rdp-root': {
      boxSizing: 'border-box',
      display: 'inline-block',
      fontSize: '1rem',
      position: 'relative',
      userSelect: 'none',

      '*': {
        boxSizing: 'border-box',
      },
    },
    '.rdp-months': {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    '.rdp-month': {
      margin: 8,
      position: 'relative',
    },
    '.rdp-month_grid': {
      borderCollapse: 'separate',
      borderSpacing: '0 2px',
    },

    // the caption is the day/month title e.g. "July 2020"
    '.rdp-month_caption': {
      alignItems: 'center',
      display: 'flex',
      height: navButtonSize,
      marginBottom: '0.5em',
      padding: '0 72px 0 0.5em',
      textAlign: 'left',
    },
    '.rdp-caption_label': {
      border: 0,
      fontSize: '1rem',
      fontWeight: 500,
      position: 'relative',
      whiteSpace: 'nowrap',
    },

    // weekdays
    '.rdp-weekday': {
      color: colors.foregroundDim,
      fontSize: '0.875rem',
      fontWeight: 500,
      padding: '0.5em',
      textAlign: 'center',

      'abbr[title]': {
        borderBottom: 'none',
        textDecoration: 'none',
      },
    },
    '.rdp-weeks': {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    '.rdp-week_number': {
      borderRight: `1px solid ${colors.border}`,
      color: colors.foregroundDim,
      fontSize: '0.75em',
      minWidth: '1em',
      padding: '0.5em',
      textAlign: 'right',
      verticalAlign: 'middle',
    },

    // navigation buttons
    '.rdp-nav': {
      display: 'flex',
      position: 'absolute',
      right: 12,
      top: 8,
      zIndex: 1,
    },
    '.rdp-button_previous, .rdp-button_next': {
      alignItems: 'center',
      appearance: 'none',
      backgroundColor: 'transparent',
      border: 0,
      borderRadius: 4,
      color: colors.foreground,
      cursor: 'pointer',
      display: 'inline-flex',
      font: 'inherit',
      height: navButtonSize,
      justifyContent: 'center',
      margin: 0,
      padding: 0,
      width: navButtonSize,

      '&:hover, &:focus-visible': {
        backgroundColor: colors.backgroundHover,
        outline: 0,
      },
      '&:focus-visible': {
        boxShadow: `0 0 0 2px ${colors.focusRing}`,
      },
      '&:active': {
        backgroundColor: colors.backgroundDim,
      },
      '&[aria-disabled="true"]': {
        color: colors.foregroundDisabled,
        cursor: 'default',
      },
    },
    '.rdp-chevron': {
      fill: 'currentColor',
      height: 18,
      width: 18,
    },

    // day grid cells and buttons
    '.rdp-day': {
      height: cellSize,
      padding: 0,
      position: 'relative',
      textAlign: 'center',
      verticalAlign: 'middle',
      width: cellSize,
    },
    '.rdp-day_button': {
      alignItems: 'center',
      appearance: 'none',
      backgroundColor: 'transparent',
      border: 0,
      borderRadius: '50%',
      color: 'inherit',
      display: 'inline-flex',
      font: 'inherit',
      height: cellSize,
      justifyContent: 'center',
      margin: 0,
      outline: 0,
      padding: 0,
      position: 'relative',
      width: cellSize,
    },
    '.rdp-outside, .rdp-disabled': {
      color: colors.foregroundDim,
    },
    '.rdp-disabled .rdp-day_button': {
      cursor: 'default',
    },
    '.rdp-day:not(.rdp-disabled):not(.rdp-outside) .rdp-day_button': {
      cursor: 'pointer',

      '&:hover, &:focus-visible': {
        boxShadow: `inset 0 0 0 2px ${interactionColor}`,
        outline: 0,
      },
    },
    '.rdp-today:not(.rdp-outside)': {
      color: palette.red400,
      fontWeight: 700,
    },
    '.rdp-selected:not(.rdp-outside) .rdp-day_button': {
      backgroundColor: interactionColor,
      color: getContrastText(interactionColor),
    },

    // range-specific day styles
    '.rdp-range_start:not(.rdp-outside)': {
      background: `linear-gradient(to right, transparent 50%, ${rangeBetweenColor} 50%)`,
    },
    '.rdp-range_end:not(.rdp-outside)': {
      background: `linear-gradient(to left, transparent 50%, ${rangeBetweenColor} 50%)`,
    },
    '.rdp-range_start.rdp-range_end:not(.rdp-outside)': {
      background: 'transparent',
    },
    '.rdp-range_middle:not(.rdp-outside)': {
      backgroundColor: rangeBetweenColor,
      color: colors.foreground,

      '.rdp-day_button': {
        backgroundColor: 'transparent',
        borderRadius: 0,
        color: 'inherit',
      },
    },
  } as const
}
