/** @jsx jsx */
import { ReactNode } from 'react';
import { jsx, css } from '@keystone-ui/core';
import Highlight, { Language, Prism } from 'prism-react-renderer';
import theme from '../lib/prism-theme';

export const Code = ({ children, className }: { children: string; className: any }) => {
  const language: Language = className ? className.replace(/language-/, '') : 'typescript';
  return (
    <Highlight Prism={Prism} code={children.trim()} language={language} theme={theme}>
      {({ className, style, tokens: tokens, getLineProps, getTokenProps }) => {
        return (
          <div
            className={className}
            style={{
              ...style,
              backgroundColor: 'transparent',
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
          </div>
        );
      }}
    </Highlight>
  );
};

export const InlineCode = ({ children }: { children: ReactNode }) => {
  return (
    <code
      className="bg-gray-200 py-1 px-1.5 m-0 rounded-sm bg-opacity-50"
      css={css`
        &::before {
          display: none;
        }
        &::after {
          display: none;
        }
        font-size: 85%;
        font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
        color: #24292e;
      `}
    >
      {children}
    </code>
  );
};
