/** @jsx jsx */

import React from 'react'; // eslint-disable-line no-unused-vars
import { jsx } from '@emotion/core';
import { colors } from '@arch-ui/theme';
import reactAddonsTextContent from 'react-addons-text-content';
import snakeCase from 'lodash.snakecase';

import { mq } from '../../utils/media';

function dashcase(children) {
  // this matches the IDs that are used for links naturally by remark
  return snakeCase(reactAddonsTextContent(children)).replace(/_/g, '-');
}

const Heading = ({ as: Tag, children, ...props }) => (
  <Tag
    css={{
      color: colors.N100,
      lineHeight: 1,
      marginBottom: '0.66em',
    }}
    id={dashcase(children)}
    {...props}
  >
    {children}
  </Tag>
);

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
