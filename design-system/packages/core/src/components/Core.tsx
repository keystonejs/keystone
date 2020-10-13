/* @jsx jsx */

import { jsx, Global } from '../emotion';
import { Fragment, ReactNode } from 'react';

import { normalize } from '../normalize';
import { useTheme } from '../theme';

type CoreProps = {
  /** The app content. */
  children: ReactNode;
  /** Include styles to normalize element styles among browsers. */
  includeNormalize?: boolean;
  /** Optimize text rendering with CSS. */
  optimizeLegibility?: boolean;
};

export const Core = ({
  children,
  includeNormalize = true,
  optimizeLegibility = true,
}: CoreProps) => {
  return (
    <Fragment>
      <BaseCSS includeNormalize={includeNormalize} optimizeLegibility={optimizeLegibility} />
      {children}
    </Fragment>
  );
};

// Base CSS
// ------------------------------

type BaseCSSProps = Omit<CoreProps, 'children'>;

const BaseCSS = ({ includeNormalize, optimizeLegibility }: BaseCSSProps) => {
  const { typography, colors } = useTheme();

  return (
    <Fragment>
      {includeNormalize && <Global styles={normalize} />}
      <Global
        styles={{
          html: {
            fontSize: 'initial !important', // ensure user's font-size settings are observed, for rems
          },

          body: {
            backgroundColor: colors.background,
            color: colors.foreground,
            fontSize: '1rem',
            fontWeight: typography.fontWeight.regular,
            lineHeight: typography.leading.base,
            fontFamily: typography.fontFamily.body,

            // optimize legibility
            ...(optimizeLegibility && {
              fontFeatureSettings: '"liga" 1', // Enable OpenType ligatures in IE
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              MozFontFeatureSettings: '"liga" on',
            }),
          },

          // Set correct default colors for links from the theme
          a: {
            color: colors.linkColor,
            ':hover': {
              color: colors.linkHoverColor,
            },
          },

          // [1] reset all box sizing to border-box
          // [2] default borders so you can add a border by specifying just the width
          '*, ::before, ::after': {
            boxSizing: 'border-box',
            borderWidth: 0,
            borderStyle: 'solid',
            borderColor: colors.border,
          },
        }}
      />
    </Fragment>
  );
};
