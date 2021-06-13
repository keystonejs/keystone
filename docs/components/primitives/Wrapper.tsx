/** @jsx jsx */
import { jsx } from '@keystone-ui/core';

import { useMediaQuery } from '../../lib/media';

export function Wrapper({ as: Tag = 'div', ...props }) {
  const mq = useMediaQuery();

  return (
    <Tag
      css={mq({
        maxWidth: 'var(--wrapper-width)',
        margin: '0 auto',
        paddingLeft: ['var(--space-xsmall)', null, 'var(--space-large)'],
        paddingRight: ['var(--space-xsmall)', null, 'var(--space-large)'],
      })}
      {...props}
    />
  );
}
