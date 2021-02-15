/** @jsx jsx */
import { useRef } from 'react';
import { ToastProvider } from '@keystone-ui/toast';
import { jsx } from '@keystone-ui/core';
import slugify from '@sindresorhus/slugify';
import { CopyToClipboard } from './CopyToClipboard';

// offset header height for hash links
const hashLinkOffset = {
  '::before': {
    content: '" "',
    height: 'calc(32px + 60px)',
    display: 'block',
    marginTop: -60,
  },
};
const getAnchor = element => {
  const text = element;
  if (typeof text === 'string') {
    return slugify(text);
  }
  return '';
};

const Heading = ({ as: Tag, children, ...props }) => {
  const headingRef = useRef(null);
  const id = getAnchor(children);
  return (
    <ToastProvider>
      <Tag
        css={{
          color: '#091E42', //N100 in arch
          fontWeight: 600,
          lineHeight: 1,
          marginBottom: '0.66em',
          marginTop: '1.66em',
        }}
        id={id}
        {...props}
      >
        <span
          ref={headingRef}
          css={{
            display: 'block',
            position: 'relative',

            '&:hover a, &:focus-within a': {
              opacity: 1,
            },
          }}
        >
          <CopyToClipboard value={children} />
          {children}
        </span>
      </Tag>
    </ToastProvider>
  );
};

export const H1 = props => (
  <Heading
    css={{
      fontSize: '2.4rem',
      fontWeight: 500,
      letterSpacing: '-0.025em',
      marginTop: 0,
    }}
    {...props}
    as="h1"
  />
);
export const H2 = props => (
  <Heading
    {...props}
    css={{
      fontSize: '1.8rem',
      fontWeight: 500,
      letterSpacing: '-0.025em',
      marginTop: 0,
      ...hashLinkOffset,
    }}
    as="h2"
  />
);
export const H3 = props => (
  <Heading
    css={{
      fontSize: '1.4rem',
      fontWeight: 500,
      letterSpacing: '-0.025em',
      marginTop: 0,
      ...hashLinkOffset,
    }}
    {...props}
    as="h3"
  />
);

export const H4 = props => (
  <Heading
    css={{
      fontSize: '1.2rem',
      ...hashLinkOffset,
    }}
    {...props}
    as="h4"
  />
);

export const H5 = props => <Heading css={{ fontSize: '1rem' }} as="h5" {...props} />;
export const H6 = props => <Heading css={{ fontSize: '0.9rem' }} as="h6" {...props} />;

export default Heading;
