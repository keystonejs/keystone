/** @jsx jsx */

import React from 'react'; // eslint-disable-line
import Highlight, { defaultProps } from 'prism-react-renderer';
import reactAddonsTextContent from 'react-addons-text-content';
import { jsx } from '@emotion/core';

import theme from '../../prism-themes/custom';

/*
This solution should be seen as extremely temporary and not a platonic ideal of code highlighting.

At the time this was written gatsby-remark-prism was not working with gatsby-mdx (leading to explosions).
This implementation is a best-guess of using prism-react-renderer with mdx. If better patterns are found
I highly encourage changing this.

Leaving styling the inline component until we have emotion
*/

export const Code = props => {
  const lang = props.className ? props.className.replace('language-', '') : null;

  return lang ? (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={reactAddonsTextContent(props.children)}
      language={lang}
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <code {...props}>
          {tokens.map((line, idx) => (
            <div {...getLineProps({ line, key: idx })}>
              {line.map((token, key) => {
                const { style, ...tokenProps } = getTokenProps({ token, key });
                return <span css={style} {...tokenProps} />;
              })}
            </div>
          ))}
        </code>
      )}
    </Highlight>
  ) : (
    <code {...props} />
  );
};
