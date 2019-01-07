import React from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import reactAddonsTextContent from 'react-addons-text-content';
import theme from '../../prism-themes/duotoneLight';

const getLanguage = className => {
  return className.replace('language-', '');
};

/*
This solution should be seen as extremely temporary and not a platonic ideal of code highlighting.

At the time this was written gatsby-remark-prism was not working with gatsby-mdx (leading to explosions).
This implementation is a best-guess of using prism-react-renderer with mdx. If better patterns are found
I highly encourage changing this.

Leaving styling the inline component until we have emotion
*/

export default props =>
  props.className ? (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={reactAddonsTextContent(props.children)}
      language={getLanguage(props.className)}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  ) : (
    <code {...props} />
  );
