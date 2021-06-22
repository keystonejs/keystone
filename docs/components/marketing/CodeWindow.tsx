/** @jsx jsx */
import type { ElementType, HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';

function MenuBtn(props) {
  return (
    <span
      css={{
        display: 'inline-block',
        width: '0.75rem',
        height: '0.75rem',
        border: '2px solid #ef6a5e',
        borderRadius: '100%',
        marginRight: '0.5rem',
      }}
      {...props}
    />
  );
}

type CodeWindowProps = {
  lines: number;
} & HTMLAttributes<HTMLElement>;

export function CodeWindow({ lines = 1, children, ...props }: HTMLAttributes<HTMLElement>) {
  const mq = useMediaQuery();

  return (
    <div
      css={mq({
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        overflow: 'hidden',
      })}
      {...props}
    >
      <div
        css={{
          borderBottom: '1px solid var(--border)',
          padding: '1rem',
        }}
      >
        <MenuBtn />
        <MenuBtn css={{ borderColor: '#f5be4f' }} />
        <MenuBtn css={{ borderColor: '#5fc454' }} />
      </div>
      <div
        css={{
          position: 'relative',
          padding: '1rem',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          paddingLeft: '4rem',
        }}
      >
        <div
          css={{
            position: 'absolute',
            whiteSpace: 'pre',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3.5rem',
            padding: '1rem 0.5rem',
            background: 'var(--code-bg)',
            color: 'var(--muted)',
            borderRight: '1px solid var(--border)',
            pointerEvents: 'none',
          }}
        >
          {Array(lines)
            .fill('')
            .map((_, i) => (
              <span
                css={{
                  display: 'block',
                  textAlign: 'right',
                  paddingRight: '0.5rem',
                }}
              >
                {++i}
              </span>
            ))}
        </div>
        <div
          css={{
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
