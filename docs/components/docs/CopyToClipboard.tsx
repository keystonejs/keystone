/** @jsx jsx */
import { useToasts } from 'react-toast-notifications';
import { jsx } from '@emotion/react';
import copy from 'copy-to-clipboard';

import { Link } from '../icons/Link';

export function CopyToClipboard({ value }: { value: string }) {
  const { addToast } = useToasts();

  const onSuccess = () => {
    addToast('Copied to clipboard', {
      appearance: 'success',
      autoDismiss: true,
      autoDismissTimeout: 2000,
    });
  };

  const onFailure = () => {
    addToast('Failed to copy to clipboard', {
      appearance: 'error',
      autoDismiss: true,
      autoDismissTimeout: 2000,
    });
  };

  const onClick = () => {
    if (typeof value !== 'string' || typeof window === 'undefined') return;
    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const text = `${url}#${value}`;

    if (navigator) {
      // use the new navigator.clipboard API if it exists
      navigator.clipboard.writeText(text).then(onSuccess, onFailure);
      return;
    } else {
      // Fallback to a library that leverages document.execCommand
      // for browser versions that don't support the navigator object.
      // As document.execCommand
      try {
        copy(text);
      } catch (e) {
        addToast({ title: 'Failed to copy to clipboard', tone: 'negative' });
      }

      return;
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
      onClick={onClick}
    >
      <Link />
    </a>
  );
}
