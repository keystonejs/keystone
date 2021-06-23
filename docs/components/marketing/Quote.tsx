/** @jsx jsx */
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';
import { Quote as QuoteIcon } from '../icons/Quote';
import { Type } from '../primitives/Type';

export function Quote({ name, title, img, grad, children, ...props }) {
  const mq = useMediaQuery();

  return (
    <div
      css={mq({
        display: 'grid',
        gridTemplateColumns: ['1fr', null, '1fr 20.625rem'],
        alignItems: 'center',
        gap: '4rem',
        margin: '9rem 0',
        padding: '4.5rem 0',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      })}
      {...props}
    >
      <div>
        <QuoteIcon grad={grad} css={{ height: '3rem' }} />
        <Type as="p" look="body24" color="var(--muted)" margin="1rem 0 0 0">
          {children}
        </Type>
      </div>
      <div>
        <div
          css={{
            height: '5.625rem',
            width: '5.625rem',
            overflow: 'hidden',
            borderRadius: '100%',
            background: `linear-gradient(135deg, var(--${grad}-1), var(--${grad}-2))`,
            padding: '4px',
          }}
        >
          <img
            src={img}
            alt={`Picture of ${name}`}
            css={{
              maxWidth: '100%',
              borderRadius: '100%',
            }}
          />
        </div>
        <Type as="p" look="heading20bold" margin="1rem 0 0.5rem 0">
          {name}
        </Type>
        <Type as="p" look="body14" color="var(--muted)">
          {title}
        </Type>
      </div>
    </div>
  );
}
