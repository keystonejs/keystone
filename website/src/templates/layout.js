/** @jsx jsx */

import React, { useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles, borderRadius, gridSize } from '@arch-ui/theme';
import { SkipNavLink } from '@reach/skip-nav';

import { Header, SiteMeta } from '../components';
import { CONTAINER_GUTTERS } from '../components/Container';
import { SIDEBAR_WIDTH } from '../components/Sidebar';
import { media, mediaMax } from '../utils/media';
import { useDimensions } from '../utils/hooks';

export const Layout = ({ children }) => {
  const [isVisible, setVisible] = useState(false);
  const toggleMenu = bool => () => setVisible(bool);
  const [headerRef, headerDimensions] = useDimensions();

  return (
    <>
      <Global
        styles={{
          ...globalStyles,

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
      <Header key="global-header" ref={headerRef} toggleMenu={toggleMenu(!isVisible)} />
      {children({ sidebarOffset: headerDimensions.height, sidebarIsVisible: isVisible })}
    </>
  );
};

// ==============================
// Layout
// ==============================

const layoutGutter = gridSize * 4;

export const Content = props => (
  <main
    css={{
      minWidth: 0,
      lineHeight: '1.6',
      paddingBottom: '3rem',
      paddingTop: layoutGutter,

      [media.sm]: {
        marginLeft: SIDEBAR_WIDTH,
        paddingLeft: layoutGutter,
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
      ul: {
        lineHeight: 1.8,
      },
      'ul > li > ul, ol > li > ol, ul > li > ol, ol > li > ul': {
        paddingLeft: '1.33rem',
      },
      blockquote: {
        fontSize: '1.25rem',
        fontStyle: 'italic',
        color: colors.N60,
        margin: `3rem 0`,
        padding: 0,
        paddingLeft: '3rem',
        position: 'relative',
      },

      // Code
      // ------------------------------

      code: {
        fontFamily: 'Consolas, Menlo, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        fontSize: '0.85em',
        fontWeight: 'normal',
      },
      pre: {
        backgroundColor: 'rgba(9, 30, 66, 0.03)',
        boxShadow: '-4px 0 0 rgba(9, 30, 66, 0.09)',
        boxSizing: 'border-box',
        fontFamily: 'Consolas,Menlo,Monaco,"Andale Mono","Ubuntu Mono",monospace',
        lineHeight: '1.2',
        padding: gridSize * 2,
        overflowX: 'auto',
        tabSize: 2,
        WebkitOverflowScrolling: 'touch',

        // our snippets seem to have an extra line...
        '.token-line:last-of-type': {
          display: 'none',
        },

        [mediaMax.sm]: {
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
