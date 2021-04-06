/* @jsx jsx */

import { Fragment, ReactNode } from 'react';
import { jsx, Global } from '../emotion';

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
            'h1,h2,h3,h4,h5,h6': { fontWeight: 'bold' },

            h1: { fontSize: '2.2rem' },
            h2: { fontSize: '1.8rem' },
            h3: { fontSize: '1.5rem' },
            h4: { fontSize: '1.2rem' },
            h5: { fontSize: '0.83rem' },
            h6: { fontSize: '0.67rem' },

            // h1: { fontSize: '2em' },
            // h2: { fontSize: '1.5em' },
            // h3: { fontSize: '1.17em' },
            // h5: { fontSize: '0.83em' },
            // h6: { fontSize: '0.67em' },

            // optimize legibility
            ...(optimizeLegibility && {
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
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
