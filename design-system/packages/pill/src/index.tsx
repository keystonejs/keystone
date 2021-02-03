/** @jsx jsx */
import { jsx, useTheme } from '@keystone-ui/core';
import { ButtonHTMLAttributes, HTMLAttributes, forwardRef, ReactNode } from 'react';

import { XIcon } from '@keystone-ui/icons/icons/XIcon';

type Tone = 'active' | 'passive' | 'positive' | 'warning' | 'negative' | 'help';
type Weight = 'bold' | 'light';

const PillButton = ({
  tone: toneKey,
  weight,
  onClick,
  tabIndex,
  ...props
}: {
  tone: Tone;
  weight: Weight;
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { radii, spacing, tones, typography } = useTheme();

  const isInteractive = !!onClick;

  const tone = tones[toneKey];
  const tokens = {
    bold: {
      background: tone.fill[0],
      foreground: tone.fillForeground[0],
      focus: {
        shadow: `0 0 0 2px ${tone.focusRing}`,
      },
      hover: {
        background: tone.fill[1],
      },
      active: {
        background: tone.fill[2],
      },
    },
    light: {
      background: tone.tint[0],
      foreground: tone.foreground[0],
      focus: {
        shadow: `0 0 0 2px ${tone.focusRing}`,
      },
      hover: {
        foreground: tone.foreground[1],
        background: tone.tint[1],
      },
      active: {
        foreground: tone.foreground[2],
        background: tone.tint[2],
      },
    },
  }[weight];

  const baseStyles = {
    alignItems: 'center',
    appearance: 'none',
    background: 'none',
    backgroundColor: tokens.background,
    border: 0,
    color: tokens.foreground,
    display: 'flex',
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    justifyContent: 'center',
    maxWidth: '100%',
    minWidth: 1,
    outline: 0,
    padding: `${spacing.small}px ${spacing.medium}px`,

    ':first-of-type': {
      paddingRight: spacing.small,
      borderTopLeftRadius: radii.full,
      borderBottomLeftRadius: radii.full,
      marginRight: 1,
    },
    ':last-of-type': {
      paddingLeft: spacing.small,
      borderTopRightRadius: radii.full,
      borderBottomRightRadius: radii.full,
    },
    ':only-of-type': {
      paddingLeft: spacing.medium,
      paddingRight: spacing.medium,
    },
  } as const;

  const interactiveStyles = isInteractive
    ? {
        cursor: 'pointer',
        ':focus': {
          boxShadow: tokens.focus.shadow,
        },
        ':hover,:focus': {
          backgroundColor: tokens.hover.background,
          color: tokens.hover.foreground,
        },
        ':active': {
          backgroundColor: tokens.active.background,
          color: tokens.active.foreground,
        },
      }
    : {};

  return (
    <button
      css={{ ...baseStyles, ...interactiveStyles }}
      onClick={onClick}
      tabIndex={!isInteractive ? -1 : tabIndex}
      {...props}
    />
  );
};

type PillProps = {
  children: ReactNode;
  onClick?: () => void;
  onRemove?: () => void;
  tone?: Tone;
  weight?: Weight;
} & HTMLAttributes<HTMLDivElement>;

export const Pill = forwardRef<HTMLDivElement, PillProps>(
  ({ weight = 'bold', tone = 'active', children, onClick, onRemove, ...props }, ref) => {
    console.log(onClick);
    return (
      <div css={{ display: 'flex' }} {...props} ref={ref}>
        <PillButton weight={weight} tone={tone} onClick={onClick}>
          {children}
        </PillButton>
        {onRemove ? (
          <PillButton weight={weight} tone={tone} onClick={onRemove}>
            <XIcon css={{ height: 14, width: 14 }} />
          </PillButton>
        ) : null}
      </div>
    );
  }
);
