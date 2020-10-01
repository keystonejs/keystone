/** @jsx jsx */

/**
 * TODO:
 *
 * - This component needs to be brought into line with either buttons (including support for tones)
 *   or better represented in the theme.
 * - Needs proper tokens and styling functions
 * - Needs size support
 * - Needs focus support
 * - Needs disabled support
 * - Needs a label wrapper like radio and checkbox
 * - Should this be stateful like a checkbox? check react-aria
 */

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { jsx, useTheme, VisuallyHidden } from '@keystone-ui/core';

import { ControlLabel } from './components/ControlLabel';

type SwitchProps = {
  /** The switch label content. */
  children: ReactNode;
} & SwitchControlProps;

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ControlLabel className={className} control={<SwitchControl ref={ref} {...props} />}>
        {children}
      </ControlLabel>
    );
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

type SwitchControlProps = {
  /** Optionally pass in "On" and "Off" label text for screen readers */
  a11yLabels?: { on: string; off: string };
  /** The current checked state. */
  checked?: boolean;
  /** Handle change events. */
  onChange?: (checked: boolean) => void;
} & Omit<ButtonProps, 'onChange'>;

export const SwitchControl = forwardRef<HTMLButtonElement, SwitchControlProps>(
  ({ a11yLabels = { on: 'On', off: 'Off' }, checked = false, onChange, ...props }, ref) => {
    let onClick = () => {
      if (onChange) {
        onChange(!checked);
      }
    };

    return (
      <Button aria-checked={checked} role="switch" onClick={onClick} ref={ref} {...props}>
        <VisuallyHidden>{checked ? a11yLabels.on : a11yLabels.off}</VisuallyHidden>
      </Button>
    );
  }
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { animation, fields, sizing } = useTheme();

  let gutter = 3;
  let trackHeight = sizing.xsmall + gutter;
  let trackWidth = trackHeight * 2 - 2 * gutter;
  let handleSize = trackHeight - gutter * 2;

  return (
    <button
      ref={ref}
      css={{
        backgroundColor: fields.controlBorderColor,
        borderRadius: 9999,
        padding: gutter,
        border: 0,
        boxSizing: 'border-box',
        display: 'block',
        outline: 0,
        overflow: 'hidden',
        position: 'relative',
        whiteSpace: 'nowrap',
        // height: trackHeight,
        width: trackWidth,
        cursor: 'pointer',

        '&[aria-checked="true"]': {
          backgroundColor: fields.selected.controlBorderColor,

          '::before': {
            transform: 'translateX(100%)',
          },
        },

        '::before': {
          height: handleSize,
          width: handleSize,
          marginTop: -1,

          backgroundColor: fields.switchForeground,
          borderRadius: '50%',
          content: '" "',
          display: 'block',
          position: 'relative',
          transition: `transform ${animation.duration400} ${animation.easeOut}`,
        },
      }}
      {...props}
    />
  );
});
