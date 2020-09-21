/** @jsx jsx */

import { jsx, keyframes, useTheme } from '@keystone-ui/core';

export const loadingSizeValues = ['large', 'medium', 'small'] as const;
export const loadingToneValues = [
  'active',
  'passive',
  'positive',
  'warning',
  'negative',
  'help',
] as const;

export type SizeKey = typeof loadingSizeValues[number];
export type ToneKey = typeof loadingToneValues[number];

// NOTE: a more accurate implementation might use `aria-busy="true|false"` on
// the wrapping element, but it's difficult to abstract

type Props = {
  /** The aria-label for screen readers. */
  label: string;
  /** The color of the loading indicator. */
  tone?: ToneKey;
  /** The size of the loading indicator. */
  size?: SizeKey;
};

// TODO: Should this be a box, to support margin etc?

export const LoadingDots = ({
  label,
  tone: toneKey,
  size: sizeKey = 'medium',
  ...props
}: Props) => {
  const { controlSizes, tones } = useTheme();

  const size = controlSizes[sizeKey];
  const tone = toneKey ? tones[toneKey] : null;
  const color = tone ? tone.fill[0] : 'currentColor';

  return (
    <div
      aria-live="polite"
      aria-label={label}
      css={{
        color,
        display: 'inline-flex',
        fontSize: size.indicatorFontSize,
      }}
      {...props}
    >
      <Dot delay={0} />
      <Dot delay={160} />
      <Dot delay={320} />
    </div>
  );
};

const fadeAnimation = keyframes({
  '0%, 80%, 100%': { opacity: 0 },
  '40%': { opacity: 1 },
});

const Dot = ({ delay }: { delay: number }) => {
  return (
    <div
      css={{
        animation: `${fadeAnimation} 1s ease-in-out infinite`,
        animationDelay: `${delay}ms`,
        backgroundColor: 'currentColor',
        borderRadius: '50%',
        display: 'block',
        height: '1em',
        width: '1em',

        '&:not(:first-of-type)': {
          marginLeft: '1em',
        },
      }}
    />
  );
};
