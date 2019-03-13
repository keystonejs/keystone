// @flow

import React from 'react';
// import SyntaxHighlighter from 'react-syntax-highlighter';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { tomorrow } from 'react-syntax-highlighter/styles/prism';

//
type PreProps = { children: string, language: string };

const grammar = {
  js: 'javascript',
};

const CodeBlock = ({ children, language, ...props }: PreProps) => {
  return (
    <SyntaxHighlighter
      language={grammar[language] || language}
      style={coy}
      customStyle={{
        borderRadius: 4,
        fontSize: 13,
        marginBottom: '1em',
        marginTop: '1em',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      {...props}
    >
      {children}
    </SyntaxHighlighter>
  );
};
CodeBlock.defaultProps = { language: 'jsx' };
//
export default CodeBlock;
// export default p => <pre {...p} />;
