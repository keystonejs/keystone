/** @jsxRuntime classic */
/** @jsx jsx */
import Highlight, { Prism } from 'prism-react-renderer';
import { jsx } from '@emotion/react';
import { ReactNode, useState } from 'react';

import theme from '../../lib/prism-theme';

type Range = { start: number; end: number; isCollapsed?: boolean };
type collapseRange = { start: number; end: number; isCollapsed?: boolean };

const getHighlightedLines = (lineHighlights: string): Range[] => {
  let ranges: Range[] = [];

  lineHighlights.split(',').forEach(something => {
    if (something.length) {
      const [a, b] = something.split('-');

      let aye = parseInt(a);
      let bee = parseInt(b);

      if (isNaN(aye)) {
        throw new Error(`When trying to do highlighting, error in {${lineHighlights}}`);
      }

      if (!isNaN(bee)) {
        ranges.push({ start: aye - 1, end: bee - 1 });
        while (aye <= bee) {
          aye++;
        }
      } else {
        ranges.push({ start: aye - 1, end: aye - 1 });
      }
    }
  });

  return ranges;
};

const getCollapsedRanges = (lineHighlights: string): collapseRange[] => {
  let ranges: collapseRange[] = [];

  lineHighlights.split(',').forEach(something => {
    if (something.length) {
      const [a, b] = something.split('-');

      let aye = parseInt(a);
      let bee = parseInt(b);

      if (isNaN(aye) || isNaN(bee)) {
        throw new Error(`When trying to get code collapse blocks, error in {${lineHighlights}}`);
      }

      ranges.push({ start: aye - 1, end: bee - 1, isCollapsed: true });
    }
  });

  return ranges;
};

const parseClassName = (
  className?: string
): { highlightRanges: Array<Range>; collapseRanges: Array<collapseRange>; language: string } => {
  let trimmedLanguage = (className || '').replace(/language-/, '');
  let language, highlights, collapses;

  if (trimmedLanguage.indexOf('{') < trimmedLanguage.indexOf('[')) {
    let [scopedLanguage, modifiers = ''] = trimmedLanguage.split('{');

    let [scopedHighlights, scopedCollapses] = modifiers.split('[');

    language = scopedLanguage;
    highlights = scopedHighlights;
    collapses = scopedCollapses;
  } else {
    let [scopedLanguage, modifiers = ''] = trimmedLanguage.split('[');

    let [scopedCollapses, scopedHighlights] = modifiers.split('{');

    language = scopedLanguage;
    highlights = scopedHighlights;
    collapses = scopedCollapses;
  }

  return {
    language: (language as any) || 'typescript',
    highlightRanges: getHighlightedLines(highlights?.replace('}', '') || ''),
    collapseRanges: getCollapsedRanges(collapses?.replace(']', '') || ''),
  };
};

const isInARange = (ranges: Range[], num: number): Range | undefined =>
  ranges.find(({ start, end }) => start <= num && end >= num);

export function Code({ children, className }: { children: string; className?: string }) {
  let { language, highlightRanges, collapseRanges } = parseClassName(className);

  const [collapseState, updateCollapseState] = useState(collapseRanges);

  return (
    <Highlight Prism={Prism} code={children.trim()} language={language as any} theme={theme}>
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
              if (collapseState.find(({ start }) => start === i)?.isCollapsed) {
                return (
                  <button
                    onClick={() => {
                      let updated = collapseState.map(item =>
                        item.start === i ? { ...item, isCollapsed: false } : item
                      );

                      updateCollapseState(updated);
                    }}
                    css={{
                      border: 'inherit',
                      background: 'var(--info-bg)',
                      ':hover': {
                        background: 'var(--warning-bg)',
                      },
                    }}
                  >
                    ...
                  </button>
                );
              }

              if (isInARange(collapseState, i)?.isCollapsed) {
                return undefined;
              }

              return (
                <div
                  key={i}
                  {...getLineProps({ line, key: i })}
                  css={
                    isInARange(highlightRanges, i) && {
                      backgroundColor: 'var(--info-bg)',
                      margin: '0 -1.1em',
                      padding: '0 1.1em',
                      borderLeft: '3px solid var(--info)',
                    }
                  }
                >
                  {line.map((token, key) => {
                    // Fix for document field import
                    if (token.content === 'document' && token.types[0] === 'imports') {
                      token.types = ['imports'];
                    }
                    return <span key={key} {...getTokenProps({ token, key })} />;
                  })}
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
