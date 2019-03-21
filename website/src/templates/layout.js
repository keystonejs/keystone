/** @jsx jsx */

import React, { useState } from 'react'; // eslint-disable-line no-unused-vars
import { jsx, Global } from '@emotion/core';
import { colors, globalStyles } from '@arch-ui/theme';
import { SkipNavLink } from '@reach/skip-nav';

import { Header, SiteMeta } from '../components';
import { media, mediaMax } from '../utils/media';
import { useDimensions } from '../utils/hooks';

const Layout = ({ children }) => {
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

export default Layout;
