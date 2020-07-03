/** @jsx jsx */

import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';
import { LinkIcon } from '@primer/octicons-react';

// offset header height for hash links
const hashLinkOffset = {
  '::before': {
    content: '" "',
    height: 'calc(32px + 60px)',
    display: 'block',
    marginTop: -60,
  },
};

const Heading = ({ as: Tag, children, id, ...props }) => {
  const iconSize = 24;
  const depth = parseInt(Tag.slice(1), 10);
  const hasLink = depth > 1 && depth < 5;
  const link = hasLink && (
    <a
      href={`#${id}`}
      css={{
        alignItems: 'center',
        color: colors.N40,
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
          color: colors.primary,
        },
      }}
    >
      <LinkIcon width={iconSize} />
    </a>
  );

  return (
    <Tag
      css={{
        color: colors.N100,
        fontWeight: 600,
        lineHeight: 1,
        marginBottom: '0.66em',
        marginTop: '1.66em',
      }}
      id={id}
      {...props}
    >
      <span
        css={{
          display: 'block',
          position: 'relative',

          '&:hover a, &:focus-within a': {
            opacity: 1,
          },
        }}
      >
        {link}
        {children}
      </span>
    </Tag>
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
