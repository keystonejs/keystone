/** @jsx jsx */

import React from 'react'; // eslint-disable-line
import Highlight, { defaultProps } from 'prism-react-renderer';
import reactAddonsTextContent from 'react-addons-text-content';
import { jsx } from '@emotion/core';
import { borderRadius, colors, gridSize } from '@arch-ui/theme';

import theme from '../../prism-themes/keystone';

/*
This solution should be seen as extremely temporary and not a platonic ideal of code highlighting.

At the time this was written gatsby-remark-prism was not working with gatsby-mdx (leading to explosions).
This implementation is a best-guess of using prism-react-renderer with mdx. If better patterns are found
I highly encourage changing this.

Leaving styling the inline component until we have emotion
*/

console.log('defaultProps', defaultProps);

export default props =>
  props.className ? (
    <Highlight
      {...defaultProps}
      tag="div"
      theme={theme}
      code={reactAddonsTextContent(props.children)}
      language={props.className.replace('language-', '')}
      data-test="what"
      style={{ backgroundColor: 'red' }}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) =>
        console.log('pre', className, style) || (
          <code>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </code>
        )
      }
    </Highlight>
  ) : (
    <code {...props} />
  );
