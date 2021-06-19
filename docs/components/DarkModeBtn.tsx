/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react';
import { jsx, Global } from '@emotion/react';

import { COLORS } from '../lib/TOKENS';
import { LightMode } from './icons/LightMode';
import { DarkMode } from './icons/DarkMode';

export function DarkModeBtn(props) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // first we check local storage, then fall back to system preferences until falling back to default 'light'
    // in the end we sanitize the strings as who knows what systems give us what...
    const detectedTheme =
      (localStorage.getItem('theme') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        'light') === 'dark'
        ? 'dark'
        : 'light';
    setTheme(detectedTheme);
    localStorage.setItem('theme', detectedTheme);

    const changer = event => {
      const detectedTheme = event.matches ? 'dark' : 'light';
      setTheme(detectedTheme);
      localStorage.setItem('theme', detectedTheme);
    };

    window.matchMedia('(prefers-color-scheme: dark)').addListener(changer);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeListener(changer);
  }, [setTheme]);

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Fragment>
      <Global
        styles={{
          ':root': {
            ...COLORS[theme],
          },
        }}
      />
      <button
        onClick={handleThemeChange}
        css={{
          display: 'inline-flex',
          appearance: 'none',
          background: 'transparent',
          boxShadow: 'none',
          border: '0 none',
          borderRadius: '100%',
          lineHeight: 1,
          padding: 0,
          margin: 0,
          color: 'var(--muted)',
          cursor: 'pointer',
          transition: 'color 0.3s ease',
          '&:hover, &:focus': {
            color: 'var(--link)',
          },
        }}
        {...props}
      >
        {theme === 'dark' ? (
          <LightMode css={{ height: 'var(--space-xlarge)' }} />
        ) : (
          <DarkMode css={{ height: 'var(--space-xlarge)' }} />
        )}
      </button>
    </Fragment>
  );
}
