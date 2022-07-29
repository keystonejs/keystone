/** @jsxRuntime classic */
/** @jsx jsx */
import type { HTMLAttributes } from 'react';
import { useToasts } from '@keystone-ui/toast';
import { jsx } from '@emotion/react';
import copy from 'copy-to-clipboard';

import { Copy } from '../icons/Copy';

type CodeBoxProps = {
  code: string;
} & HTMLAttributes<HTMLElement>;

export function CodeBox({ code, ...props }: CodeBoxProps) {
  const { addToast } = useToasts();

  const handleCopy = () => {
    if (navigator) {
      // use the new navigator.clipboard API if it exists
      navigator.clipboard.writeText(code).then(
        () => addToast({ title: 'Copied to clipboard', tone: 'positive' }),
        () => addToast({ title: 'Failed to copy to clipboard', tone: 'negative' })
      );
      return;
    } else {
      // Fallback to a library that leverages document.execCommand
      // for browser versions that don't support the navigator object.
      // As document.execCommand
      try {
        copy(code);
      } catch (e) {
        addToast({ title: 'Failed to copy to clipboard', tone: 'negative' });
      }

      return;
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
