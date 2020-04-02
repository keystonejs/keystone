/** @jsx jsx */

import { useCallback, useRef } from 'react';
import { useClipboard } from 'use-clipboard-copy';
import { jsx } from '@emotion/core';
import { colors, borderRadius, gridSize } from '@arch-ui/theme';

import { CONTAINER_GUTTERS } from '../Container';
import { mediaMax } from '../../utils/media';

import theme from '../../prism-themes/custom';

const commonCodeStyles = {
  fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
  fontSize: '0.85em',
  fontWeight: 'normal',
};
export const InlineCode = props => (
  <code
    css={{
      ...commonCodeStyles,
      backgroundColor: 'rgba(255, 227, 128,0.2)',
      borderRadius: 2,
      color: colors.N100,
      margin: 0,
      padding: '0.2em 0.4em',
    }}
    {...props}
  />
);

function themeToDict(theme, language) {
  const { plain } = theme;

  const styles = theme.styles.map(themeEntry => {
    const { types, languages, style } = themeEntry;
    if (languages && !languages.includes(language)) {
      return {};
    }

    return types.reduce((acc, type) => {
      const accStyle = { ...acc[type], ...style };

      return Object.assign(acc, {
        [`.${type}`]: accStyle,
      });
    }, {});
  });

  const themeDict = Object.assign(
    {
      '.root': plain,
      '.plain': { ...plain, backgroundColor: null },
    },
    ...styles
  );

  return themeDict;
}

// NOTE: `metastring` is everything after the language declaration e.g. ```javascript title=package.json allowCopy=false
// We ignore it because the space separated values come in as props
export const CodeBlock = ({
  allowCopy: allowCopyStr = 'true',
  metastring,
  showLanguage: showLanguageStr = 'true',
  title,
  ...props
}) => {
  let language = props.className ? props.className.replace('language-', '') : null;
  let themeStyles = themeToDict(theme, language);
  let codeRef = useRef();
  let clipboard = useClipboard({ copiedTimeout: 750 });
  let handleCopy = useCallback(() => {
    clipboard.copy(codeRef.current.innerText.trim());
  }, [clipboard.copy]);

  let allowCopy = resolveBool(allowCopyStr);
  let showLanguage = resolveBool(showLanguageStr);
  let hasHeader = title || allowCopy || showLanguage;

  return (
    <div css={{ marginBottom: '1em', marginTop: '1em' }}>
      {hasHeader && (
        <Header>
          {title ? <Title>{title}</Title> : <span />}
          <div css={{ alignItems: 'center', display: 'flex' }}>
            {language && showLanguage && <Language>{languageLabel(language)}</Language>}
            {allowCopy && (
              <CopyButton onClick={handleCopy}>{clipboard.copied ? 'Copied!' : 'Copy'}</CopyButton>
            )}
          </div>
        </Header>
      )}
      <Pre hasHeader={hasHeader} className={props.className}>
        <code ref={codeRef} css={{ ...commonCodeStyles, ...themeStyles }} {...props} />
      </Pre>
    </div>
  );
};

// Styled Components
// ------------------------------

const Header = props => (
  <div
    css={{
      alignItems: 'center',
      backgroundColor: colors.page,
      border: `1px solid ${colors.N10}`,
      borderBottom: 0,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      display: 'flex',
      justifyContent: 'space-between',
      padding: gridSize,
    }}
    {...props}
  />
);
const Title = props => (
  <div
    css={{
      ...commonCodeStyles,
      color: colors.N60,
      padding: `2px 0 2px ${gridSize}px`,
    }}
    {...props}
  />
);
const Language = props => (
  <div
    css={{
      color: colors.N80,
      fontSize: '0.85rem',
      padding: `2px 0`,

      ':only-child': {
        paddingRight: gridSize,
      },
    }}
    {...props}
  />
);
const CopyButton = props => (
  <button
    css={{
      background: 0,
      border: 0,
      borderRadius: 3,
      color: colors.N80,
      cursor: 'pointer',
      fontSize: '0.85rem',
      lineHeight: 'inherit',
      marginLeft: gridSize,
      padding: `2px 0`,
      width: 60,

      ':hover, :focus': {
        background: colors.N10,
      },
      ':active': {
        background: colors.N15,
      },
    }}
    {...props}
  />
);

const Pre = ({ hasHeader, ...props }) => (
  <pre
    css={{
      backgroundColor: colors.N05,
      border: `1px solid ${colors.N10}`,
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      borderTopLeftRadius: hasHeader ? null : borderRadius,
      borderTopRightRadius: hasHeader ? null : borderRadius,
      boxSizing: 'border-box',
      fontFamily: 'Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace',
      lineHeight: '1.4',
      margin: 0,
      padding: gridSize * 2,
      overflowX: 'auto',
      tabSize: 2,
      WebkitOverflowScrolling: 'touch',

      [mediaMax.sm]: {
        borderRadius: 0,
        borderLeft: 0,
        borderRight: 0,
        marginLeft: -CONTAINER_GUTTERS[0],
        marginRight: -CONTAINER_GUTTERS[0],
      },
    }}
    {...props}
  />
);

// Utils
// ------------------------------

function languageLabel(lang) {
  let map = {
    bash: 'shell', // this is a bit dodgy, we should probably replace `bash` references with `shell`...
    graphql: 'GraphQL',
    javascript: 'JS',
    js: 'JS',
    json: 'JSON',
    jsx: 'JSX',
    sh: 'shell',
    sql: 'SQL',
    ts: 'TS',
    typescript: 'TS',
  };

  return map[lang] || lang;
}

function resolveBool(str) {
  if (str === 'true') return true;
  if (str === 'false') return false;

  return undefined;
}
