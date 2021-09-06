/** @jsxRuntime classic */
/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';

export function Section(props: HTMLAttributes<HTMLElement>) {
  const mq = useMediaQuery();

  return (
    <section
      css={mq({
        marginTop: ['5rem', '6.5rem'],
      })}
      {...props}
    />
  );
}

type SideBySideSectionProps = {
  reverse?: boolean;
} & HTMLAttributes<HTMLElement>;

export function SideBySideSection({ reverse, children, ...props }: SideBySideSectionProps) {
  const mq = useMediaQuery();

  return (
    <Section
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr', null, '1fr 1fr'],
        gap: '2rem',
        alignItems: 'center',
        ...(reverse
          ? {
              'div:nth-of-type(1)': {
                order: [1, null, 2],
              },
              'div:nth-of-type(2)': {
                order: [2, null, 1],
              },
            }
          : {}),
      })}
      {...props}
    >
      {children}
    </Section>
  );
}
