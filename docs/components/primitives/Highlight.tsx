/** @jsx jsx */
import { jsx } from '@emotion/react';
import { HTMLAttributes, ElementType } from 'react';

const styleMap = {
  grad1: {
    '--grad-1': 'var(--grad1-1)',
    '--grad-2': 'var(--grad1-2)',
  },
  grad2: {
    '--grad-1': 'var(--grad2-1)',
    '--grad-2': 'var(--grad2-2)',
  },
  grad3: {
    '--grad-1': 'var(--grad3-1)',
    '--grad-2': 'var(--grad3-2)',
  },
  grad4: {
    '--grad-1': 'var(--grad4-1)',
    '--grad-2': 'var(--grad4-2)',
  },
};

type HighlightProps = {
  as: ElementType;
  look: keyof typeof styleMap;
} & HTMLAttributes<HTMLElement>;

export function Highlight({ look = 'grad1', as: Tag = 'span', ...props }: HighlightProps) {
  return (
    <Tag
      css={{
        ...styleMap[look],
        backgroundImage: 'linear-gradient(to right, var(--grad-1), var(--grad-2))',
        backgroundClip: 'text',
        color: 'transparent',
      }}
      {...props}
    />
  );
}
