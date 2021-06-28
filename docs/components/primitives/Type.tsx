/** @jsx jsx */
import { jsx } from '@emotion/react';

import { forwardRefWithAs } from '../../lib/forwardRefWithAs';
import { useMediaQuery } from '../../lib/media';

const common = {
  brand: {
    fontFamily: 'var(--font-brand)',
    color: 'var(--text-heading)',
    lineHeight: 1.3,
  },
  body: {
    fontFamily: 'var(--font-body)',
    color: 'var(--text)',
    lineHeight: 1.2,
    maxWidth: '85ch',
  },
};

export const styleMap = {
  heading20: {
    ...common.brand,
    fontSize: '1.25rem',
    fontWeight: 400,
  },
  heading20bold: {
    ...common.brand,
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  heading24: {
    ...common.brand,
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  heading30: {
    ...common.brand,
    fontSize: '1.875rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  heading36: {
    ...common.brand,
    fontSize: '2.25rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  heading48: {
    ...common.brand,
    fontSize: '3rem',
    fontWeight: 700,
    letterSpacing: '-0.05em',
  },
  heading64: {
    ...common.brand,
    fontSize: '4rem',
    fontWeight: 700,
    letterSpacing: '-0.05em',
  },
  heading84: {
    ...common.brand,
    fontSize: '5.25rem',
    fontWeight: 900,
    letterSpacing: '-0.05em',
  },
  heading92: {
    ...common.brand,
    fontSize: '5.75rem',
    fontWeight: 900,
    letterSpacing: '-0.025em',
    lineHeight: 1.2,
  },

  body12: {
    ...common.body,
    fontSize: '0.75rem',
    fontWeight: 400,
  },
  body12bold: {
    ...common.body,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  body14: {
    ...common.body,
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.7,
  },
  body14bold: {
    ...common.body,
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  body16: {
    ...common.body,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.7,
  },
  body16bold: {
    ...common.body,
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.7,
  },
  body18: {
    ...common.body,
    fontSize: '1.125rem',
    fontWeight: 400,
    lineHeight: 1.7,
  },
  body18bold: {
    ...common.body,
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.7,
  },
  body20: {
    ...common.body,
    fontSize: '1.25rem',
    fontWeight: 400,
    lineHeight: 1.7,
  },
  body20bold: {
    ...common.body,
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.7,
  },
  body24: {
    ...common.body,
    fontSize: '1.5rem',
    fontWeight: 400,
    lineHeight: 1.7,
  },
  body24bold: {
    ...common.body,
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.7,
  },
} as const;

type TypeProps = {
  look?: keyof typeof styleMap;
  fontSize?: string | Array<string | null>;
  margin?: string | Array<string | null>;
  padding?: string | Array<string | null>;
  color?: string | Array<string | null>;
};

export const Type = forwardRefWithAs<'span', TypeProps>(
  ({ as: Tag = 'span', look, fontSize, margin, padding, color, ...props }, ref) => {
    const mq = useMediaQuery();

    return (
      <Tag
        ref={ref}
        css={mq({
          ...(look ? styleMap[look] : {}),
          ...(color ? { color } : {}),
          ...(fontSize ? { fontSize } : {}),
          ...(margin ? { margin } : {}),
          ...(padding ? { padding } : {}),
        })}
        {...props}
      />
    );
  }
);
Type.displayName = 'Type';
