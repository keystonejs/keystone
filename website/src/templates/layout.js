/** @jsx jsx */

import { Fragment, useState } from 'react';
import { jsx, Global } from '@emotion/core';
import { colors, borderRadius, gridSize } from '@arch-ui/theme';
import { SkipNavLink } from '@reach/skip-nav';

import { Header, SiteMeta } from '../components';
import { CONTAINER_GUTTERS } from '../components/Container';
import { media, mediaMax } from '../utils/media';

export const Layout = ({ children }) => {
  const [isVisible, setVisible] = useState(false);
  const toggleMenu = bool => () => setVisible(bool);

  return (
    <Fragment>
      <Global
        styles={{
          body: {
            backgroundColor: colors.page,
            color: colors.N80,
            fontFamily:
              '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
            letterSpacing: '-0.005em',
            margin: 0,
            textDecorationSkip: 'ink',
            textRendering: 'optimizeLegibility',
            msOverflowStyle: '-ms-autohiding-scrollbar',
            MozFontFeatureSettings: "'liga' on",
            MozOsxFontSmoothing: 'grayscale',
            WebkitFontSmoothing: 'antialiased',
          },
          a: {
            textDecoration: 'none',
          },

          // Accessibility
          // ------------------------------

          '.js-focus-visible :focus:not(.focus-visible)': {
            outline: 'none',
          },
          '.js-focus-visible .focus-visible': {
            outline: `2px dashed ${colors.B.A60}`,
            outlineOffset: 2,
          },

          '[data-reach-skip-link]': {
            borderColor: 'initial',
            borderImage: 'initial',
            borderStyle: 'initial',
            borderWidth: '0px',
            clip: 'rect(0px, 0px, 0px, 0px)',
            color: colors.primary,
            fontSize: '0.875rem',
            height: '1px',
            margin: '-1px',
            overflow: 'hidden',
            padding: '0px',
            position: 'absolute',
            width: '1px',
            zIndex: '100',
          },
          '[data-reach-skip-link]:focus': {
            background: 'rgb(255, 255, 255)',
            clip: 'auto',
            height: 'auto',
            left: '1.5rem',
            padding: '1rem',
            position: 'fixed',
            textDecoration: 'none',
            top: '1.5rem',
            width: 'auto',
          },

          // Device Tweaks
          // ------------------------------

          [mediaMax.sm]: {
            body: { fontSize: 'inherit' },
            html: { fontSize: 14 },
          },
          [media.sm]: {
            body: { fontSize: 'inherit' },
            html: { fontSize: 16 },
          },
        }}
      />
      <SkipNavLink />
      <SiteMeta pathname="/" />
      <Header key="global-header" toggleMenu={toggleMenu(!isVisible)} />
      {children({
        sidebarIsVisible: isVisible,
        toggleSidebar: toggleMenu(!isVisible),
      })}
    </Fragment>
  );
};

// ==============================
// Layout
// ==============================

export const Content = props => (
  <main
    css={{
      minWidth: 0,
      lineHeight: '1.6',

      [mediaMax.sm]: {
        padding: gridSize * 2,
      },
      [media.sm]: {
        paddingLeft: gridSize * 6,
      },

      // TODO: doesn't play nice with "gatsby-resp-image-wrapper"
      img: {
        backgroundColor: 'white',
        borderRadius,
        boxSizing: 'border-box',
        boxShadow: '0 0 0 1px hsla(0, 0%, 0%, 0.1), 0 4px 11px hsla(0, 0%, 0%, 0.1) !important',
        display: 'block',
        marginBottom: '2rem',
        marginTop: '2rem',
        maxWidth: '100%',
      },

      // NOTE: consider removing `gatsby-resp-image-wrapper`
      '.gatsby-resp-image-link, .gatsby-resp-image-link:hover, .gatsby-resp-image-link:focus': {
        background: 0,
        border: 0,
        marginBottom: '2rem',
        marginTop: '2rem',
      },

      // Misc. Typography
      // ------------------------------
      'li, p': {
        lineHeight: 1.6,
      },
      'ul > li > ul, ol > li > ol, ul > li > ol, ol > li > ul': {
        paddingLeft: '1.33rem',
      },
      blockquote: {
        borderLeft: `2px solid ${colors.B.base}`,
        margin: `1.66rem 0`,
        padding: '1rem',
        position: 'relative',
      },
      'blockquote > p:first-of-type': {
        marginTop: 0,
      },
      'blockquote > p:last-of-type': {
        marginBottom: 0,
      },

      // Code
      // ------------------------------

      code: {
        fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        fontSize: '0.85em',
        fontWeight: 'normal',
      },
      pre: {
        backgroundColor: colors.N05,
        border: `1px solid ${colors.N10}`,
        borderRadius: 4,
        boxSizing: 'border-box',
        fontFamily: 'Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace',
        lineHeight: '1.4',
        padding: gridSize * 2,
        overflowX: 'auto',
        tabSize: 2,
        WebkitOverflowScrolling: 'touch',

        // our snippets seem to have an extra line...
        '.token-line:last-of-type': {
          display: 'none',
        },

        [mediaMax.sm]: {
          borderRadius: 0,
          borderLeft: 0,
          borderRight: 0,
          marginLeft: -CONTAINER_GUTTERS[0],
          marginRight: -CONTAINER_GUTTERS[0],
        },
      },

      '& :not(pre) > code': {
        backgroundColor: 'rgba(255, 227, 128,0.2)',
        borderRadius: 2,
        color: colors.N100,
        margin: 0,
        padding: '0.2em 0.4em',
      },

      '& h1 > code, & h2 > code, & h3 > code, & h4 > code, & h5 > code, & h6 > code': {
        backgroundColor: 'rgba(255, 235, 229, 0.6)',
      },
    }}
    {...props}
  />
);
