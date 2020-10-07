/** @jsx jsx */
import { jsx, useTheme } from '@keystone-ui/core';
import { ButtonHTMLAttributes, HTMLAttributes, forwardRef, ReactNode } from 'react';

import { XIcon } from '@keystone-ui/icons/icons/XIcon';

type Tone = 'active' | 'passive' | 'positive' | 'warning' | 'negative' | 'help';
type Weight = 'bold' | 'light';

const PillButton = ({
  tone: toneKey,
  weight,
  ...props
}: {
  tone: Tone;
  weight: Weight;
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
  const fontSizeNumeric = 0.85;
  const fontSize = `${fontSizeNumeric}rem`;
  const borderRadius = `${fontSizeNumeric * 2}rem`;
  const { tones, spacing } = useTheme();
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
  return (
    <button
      css={{
        appearance: 'none',
        background: 'none',
        padding: `${spacing.small}px ${spacing.xsmall}px`,
        backgroundColor: tokens.background,
        color: tokens.foreground,
        alignItems: 'center',
        border: 0,
        cursor: 'pointer',
        display: 'flex',
        fontSize,
        justifyContent: 'center',
        maxWidth: '100%',
        minWidth: 1,
        outline: 0,

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

        ':first-of-type': {
          paddingLeft: '0.9em',
          paddingRight: '0.75em',
          borderTopLeftRadius: borderRadius,
          borderBottomLeftRadius: borderRadius,
          marginRight: 1,
        },
        ':last-of-type': {
          paddingLeft: '0.75em',
          paddingRight: '0.9em',
          borderTopRightRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
          marginLeft: 1,
        },
      }}
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
    return (
      <div css={{ display: 'flex' }} {...props} ref={ref}>
        <PillButton weight={weight} tone={tone} onClick={onClick}>
          {children}
        </PillButton>
        {onRemove ? (
          <PillButton weight={weight} tone={tone} onClick={onRemove}>
            <XIcon css={{ height: 12 }} />
          </PillButton>
        ) : null}
      </div>
    );
  }
);
