import React from 'react';
import Highlight, { defaultProps, Language } from 'prism-react-renderer';

export const Code = ({ children, className }: { children: string; className: any }) => {
  const language: Language = className ? className.replace(/language-/, '') : 'typescript';
  return (
    <Highlight {...defaultProps} code={children} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        return (
          <pre
            className={className}
            style={{
              ...style,
              backgroundColor: 'transparent',
              padding: '20px',
              margin: '0',
            }}
          >
            {tokens.map((line, i) => {
              return (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              );
            })}
          </pre>
        );
      }}
    </Highlight>
  );
};
