/** @jsxRuntime classic */
/** @jsx jsx */
import { useToasts } from '@keystone-ui/toast';
import { jsx } from '@emotion/react';
import copy from 'clipboard-copy';

import { Link } from '../icons/Link';

export function CopyToClipboard({ value }: { value: string }) {
  const { addToast } = useToasts();

  const handleCopy = () => {
    if (typeof value !== 'string' || typeof window === 'undefined') return;

    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const text = `${url}#${value}`;

    try {
      copy(text);
      addToast({ title: 'Copied to clipboard', tone: 'positive' });
    } catch (e) {
      addToast({ title: 'Failed to copy to clipboard', tone: 'negative' });
    }
  };

  return (
    <a
      href={`#${value}`}
      css={{
        position: 'absolute',
        top: '50%',
        left: '-0.25rem',
        display: 'flex',
        padding: 0,
        alignItems: 'center',
        color: 'var(--text)',
        fontSize: 'var(--font-small)',
        height: '1rem',
        width: '1rem',
        justifyContent: 'center',
        opacity: 0,
        overflow: 'visible',
        margin: '-0.5rem 0 0 0',
        transform: 'translateX(-100%)',
        borderRadius: '100%',

        '&:hover': {
          color: 'var(--link)',
        },
      }}
      onClick={handleCopy}
    >
      <Link css={{ height: '1rem' }} />
    </a>
  );
}
