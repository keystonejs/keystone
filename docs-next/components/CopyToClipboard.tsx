/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import copy from 'copy-to-clipboard';
import { LinkIcon } from '@primer/octicons-react';
import { useToasts } from '@keystone-ui/toast';

export const CopyToClipboard = ({ value }: { value: string }) => {
  const iconSize = 24; // arch-ui theme
  const gridSize = 8; // arch-ui theme
  const { addToast } = useToasts();

  const onSuccess = () => {
    addToast({ title: 'Copied to clipboard', tone: 'positive' });
  };
  const onFailure = () => {
    addToast({ title: 'Faild to oopy to clipboard', tone: 'negative' });
  };
  const onClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (typeof value !== 'string' || typeof window === 'undefined') return;
    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    const text = `${url}#${value}`;
    if (navigator) {
      // use the new navigator.clipboard API if it exists
      navigator.clipboard.writeText(text).then(onSuccess, onFailure);
      return;
    } else {
      // Fallback to a library that leverages document.execCommand
      // for browser versions that dont' support the navigator object.
      // As document.execCommand
      try {
        copy(text);
      } catch (e) {
        addToast({ title: 'Faild to oopy to clipboard', tone: 'negative' });
      }

      return;
    }
  };

  return (
    <a
      href={`#`}
      css={{
        alignItems: 'center',
        color: '#97A0AF', // colors.n40
        display: 'flex',
        fontSize: '1rem',
        height: iconSize,
        justifyContent: 'center',
        marginTop: -iconSize / 2,
        opacity: 0,
        overflow: 'visible',
        paddingRight: gridSize / 2,
        position: 'absolute',
        top: '50%',
        transform: 'translateX(-100%)',
        width: iconSize,

        '&:hover': {
          color: '#2684FF', // colors.primary
        },
      }}
      onClick={onClick}
    >
      <LinkIcon />
    </a>
  );
};
