/** @jsx jsx */

import { jsx } from '@emotion/core';

import theme from '../../prism-themes/custom';

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
      ['.root']: plain,
      ['.plain']: { ...plain, backgroundColor: null },
    },
    ...styles
  );

  return themeDict;
}

export const Code = props => {
  const lang = props.className ? props.className.replace('language-', '') : null;
  const styles = themeToDict(theme, lang);

  return <code css={styles} {...props} />;
};
