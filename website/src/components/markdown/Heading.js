/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { colors, gridSize } from '@arch-ui/theme';
import { LinkIcon } from '@arch-ui/icons';

import { mq } from '../../utils/media';

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
        lineHeight: 1,
        marginBottom: '0.66em',
        position: 'relative',

        '&:hover a': {
          opacity: 1,
        },
      }}
      id={id}
      {...props}
    >
      {link}
      {children}
    </Tag>
  );
};

export const H1 = props => (
  <Heading
    css={mq({
      fontSize: ['2.4rem', '3.2rem'],
      marginTop: 0,
    })}
    {...props}
    as="h1"
  />
);
export const H2 = props => (
  <Heading
    {...props}
    css={mq({
      fontSize: ['1.8rem', '2.4rem'],
      fontWeight: 300,
      marginTop: '1.33em',
    })}
    as="h2"
  />
);
export const H3 = props => (
  <Heading
    css={mq({
      fontSize: ['1.4rem', '1.6rem'],
      fontWeight: 500,
      marginTop: '1.5em',
    })}
    {...props}
    as="h3"
  />
);
export const H4 = props => <Heading css={{ fontSize: '1.2rem' }} {...props} as="h4" />;
export const H5 = props => <Heading {...props} css={{ fontSize: '1rem' }} as="h5" />;
export const H6 = props => <Heading {...props} css={{ fontSize: '0.9rem' }} as="h6" />;

export default Heading;
