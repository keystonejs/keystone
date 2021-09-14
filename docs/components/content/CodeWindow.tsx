/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';

import { useMediaQuery } from '../../lib/media';

const codeFontStyle = {
  fontSize: 13,
  lineHeight: 1.6,
  fontFamily: 'var(--font-mono)',
};

function MenuBtn(props: HTMLAttributes<HTMLElement>) {
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

export function WindowWrapper(props: HTMLAttributes<HTMLElement>) {
  return (
    <div
      css={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
      }}
      {...props}
    />
  );
}

export function WindowL(props: HTMLAttributes<HTMLElement>) {
  return (
    <pre
      css={{
        overflow: 'auto',
        padding: '0.5rem 1rem 1rem',
        ...codeFontStyle,
      }}
      {...props}
    />
  );
}

export function WindowR(props: HTMLAttributes<HTMLElement>) {
  return (
    <pre
      css={{
        overflow: 'auto',
        background: 'var(--code-bg)',
        borderLeft: '1px solid var(--border)',
        padding: '0.5rem 1rem 1rem',
        ...codeFontStyle,
      }}
      {...props}
    />
  );
}

type CodeWindowProps = {
  lines: number;
} & HTMLAttributes<HTMLElement>;

export function CodeWindow({ lines = 1, children, ...props }: CodeWindowProps) {
  const mq = useMediaQuery();

  return (
    <div
      css={mq({
        border: '1px solid var(--border)',
        borderRadius: '1rem',
        overflow: 'hidden',
        marginTop: '1rem',
        background: 'var(--app-bg)',
        boxShadow: '0px 20px 38px -7px var(--shadow)',
      })}
      {...props}
    >
      <div
        css={{
          borderBottom: '1px solid var(--border)',
          padding: '0.625rem 1.75rem',
        }}
      >
        <MenuBtn />
        <MenuBtn css={{ borderColor: '#f5be4f' }} />
        <MenuBtn css={{ borderColor: '#5fc454' }} />
      </div>
      <div
        css={{
          display: 'grid',
          gridTemplateColumns: '3.5rem auto',
          gap: '0.5rem',
        }}
      >
        <div
          css={{
            padding: '0.5rem 0.5rem 1rem',
            background: 'var(--code-bg)',
            color: 'var(--muted)',
            borderRight: '1px solid var(--border)',
            pointerEvents: 'none',
            ...codeFontStyle,
          }}
        >
          {Array(lines)
            .fill('')
            .map((_, i) => (
              <span
                key={`line-${i}`}
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
            position: 'relative',
            padding: 0,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
