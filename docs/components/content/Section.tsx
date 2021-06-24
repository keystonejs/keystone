/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';

export function Section(props: HTMLAttributes<HTMLElement>) {
  const mq = useMediaQuery();

  return (
    <section
      css={mq({
        marginTop: ['5rem', '9.5rem'],
      })}
      {...props}
    />
  );
}
