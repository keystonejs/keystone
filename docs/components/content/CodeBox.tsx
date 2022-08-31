/** @jsxRuntime classic */
/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { useToasts } from '@keystone-ui/toast';
import { jsx } from '@emotion/react';
import copy from 'clipboard-copy';

import { Copy } from '../icons/Copy';

type CodeBoxProps = {
  code: string;
} & HTMLAttributes<HTMLElement>;

export function CodeBox({ code, ...props }: CodeBoxProps) {
  const { addToast } = useToasts();

  const handleCopy = async () => {
    try {
      await copy(code);
      addToast({ title: 'Copied to clipboard', tone: 'positive' });
    } catch (e) {
      addToast({ title: 'Failed to copy to clipboard', tone: 'negative' });
    }
  };

  return (
    <div
      css={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        background: 'var(--code-bg)',
        fontSize: '1.125rem',
        fontFamily: 'var(--font-mono)',
        padding: '0.75rem 1rem',
        ':before': {
          content: '"$"',
          display: 'inline-block',
          color: 'var(--muted)',
          marginRight: '1rem',
        },
      }}
      {...props}
    >
      {code}
      <button
        onClick={handleCopy}
        css={{
          display: 'inline-flex',
          appearance: 'none',
          border: '0 none',
          borderRadius: '100%',
          boxShadow: 'none',
          background: 'transparent',
          padding: '0.25rem',
          marginLeft: '1rem',
          cursor: 'pointer',
          color: 'var(--muted)',
          alignItems: 'center',
        }}
      >
        <Copy css={{ height: '1.5rem' }} />
      </button>
    </div>
  );
}
