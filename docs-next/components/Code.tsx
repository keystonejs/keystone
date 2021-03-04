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
              backgroundColor: 'transparent !important',
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
      className="bg-gray-100 py-1 px-1.5 m-0 rounded-sm"
      css={css`
        &::before {
          display: none;
        }
        &::after {
          display: none;
        }
        font-size: 85% !important;
        font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
        color: #24292e !important;
      `}
    >
      {children}
    </code>
  );
};
