/** @jsx jsx */
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';

export function Wrapper({ as: Tag = 'div', ...props }) {
  const mq = useMediaQuery();

  return (
    <Tag
      css={mq({
        maxWidth: 'var(--wrapper-width)',
        margin: '0 auto',
        paddingLeft: ['var(--space-xsmall)', null, 'var(--space-large)', '3rem'],
        paddingRight: ['var(--space-xsmall)', null, 'var(--space-large)', '3rem'],
      })}
      {...props}
    />
  );
}
