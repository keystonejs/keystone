import React from 'react';
import Highlight, { Language, Prism } from 'prism-react-renderer';
import theme from '../lib/prism-theme';

export const Code = ({ children, className }: { children: string; className: any }) => {
  const language: Language = className ? className.replace(/language-/, '') : 'typescript';
  return (
    <Highlight Prism={Prism} code={children} language={language} theme={theme}>
      {({ className, style, tokens: tokens, getLineProps, getTokenProps }) => {
        return (
          <div
            className={className}
            style={{
              ...style,
              backgroundColor: 'transparent !important',
            }}
          >
            {tokens.map((line, i) => {
              // Suppress a trailing empty line in the code block
              if (i === tokens.length - 1 && line.length === 1 && !line[0].content) return;
              return (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              );
            })}
          </div>
        );
      }}
    </Highlight>
  );
};
