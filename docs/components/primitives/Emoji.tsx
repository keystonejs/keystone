/** @jsx jsx */
import { jsx, keyframes } from '@emotion/react';
import { useRef, useState, useEffect, HTMLAttributes, ReactNode } from 'react';

const fadeInTop = keyframes`
  from {
    bottom: -0.5em;
    opacity: 0;
  }
  to {
    bottom: 100%;
    opacity: 1;
  }
`;

const fadeInBottom = keyframes`
  from {
    top: -0.5em;
    opacity: 0;
  }
  to {
    top: 100%;
    opacity: 1;
  }
`;

/*
 * The Emoji component makes emojis more accessible to people:
 * - who have difficulty seeing the difference between a crying face and a laughing face
 * - who cannot see
 * - who print pages
 *
 * Read more here: https://adrianroselli.com/2016/12/accessible-emoji-tweaked.html
 */

type EmojiProps = {
  symbol: ReactNode;
  alt: string;
} & HTMLAttributes<HTMLElement>;

export function Emoji({ symbol, alt, ...props }: EmojiProps) {
  const posRef = useRef<HTMLElement>();
  const [showOnTop, setShownTop] = useState(true);

  useEffect(() => {
    if (posRef.current && posRef.current.offsetTop - window.pageYOffset < 50) {
      setShownTop(false);
    }
  });

  return (
    <span
      ref={posRef}
      role="img"
      aria-label={alt}
      tabIndex={0}
      css={{
        position: 'relative',
        ':focus:after,:hover:after': {
          position: 'absolute',
          display: 'block',
          zIndex: 1,
          bottom: showOnTop ? '100%' : 'inherit',
          top: showOnTop ? 'inherit' : '100%',
          left: 0,
          padding: '0.5em 0.75em',
          borderRadius: '0.5em',
          boxShadow: '0 0 0.2em rgba(0, 0, 0, 0.5)',
          content: `"${alt}"`,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: '#fff',
          textAlign: 'center',
          fontSize: '0.8rem',
          opacity: 0,
          animation: `${showOnTop ? fadeInTop : fadeInBottom} 0.1s ease-out 0.3s 1 forwards`,
        },
        '@media print': {
          ':after': {
            content: `' ("${alt}") '`,
            fontSize: '0.8rem',
          },
        },
      }}
      {...props}
    >
      {symbol}
    </span>
  );
}
