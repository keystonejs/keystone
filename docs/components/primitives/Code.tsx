/** @jsx jsx */
import Highlight, { Language, Prism } from 'prism-react-renderer';
import { jsx } from '@emotion/react';
import { ReactNode } from 'react';

import theme from '../../lib/prism-theme';

export function Code({ children, className }: { children: string; className: any }) {
  const language: Language = className ? className.replace(/language-/, '') : 'typescript';
  return (
    <Highlight Prism={Prism} code={children.trim()} language={language} theme={theme}>
      {({ className, style, tokens: tokens, getLineProps, getTokenProps }) => {
        return (
          <div
            className={className}
            css={{
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
}

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code
      css={{
        display: 'inline-block',
        color: 'var(--code)',
        background: 'var(--code-bg)',
        padding: '0 var(--space-medium)',
        margin: 0,
        border: '1px solid var(--border)',
        borderRadius: '5px',
        fontSize: '85%',
        fontFamily: 'var(--font-mono)',
        wordBreak: 'break-all',
      }}
    >
      {children}
    </code>
  );
}
