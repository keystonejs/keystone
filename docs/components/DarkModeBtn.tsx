/** @jsx jsx */
import { Fragment, useState, useEffect, HTMLAttributes } from 'react';
import { jsx, Global } from '@emotion/react';

import { COLORS } from '../lib/TOKENS';
import { LightMode } from './icons/LightMode';
import { DarkMode } from './icons/DarkMode';

// NOTE: We are disabling auto-detect dark mode while we make some design tweaks and are happy
// to ship it by default for "system is dark mode" users. IT WILL RETURN
const AUTO_DETECT = true;

export function DarkModeBtn(props: HTMLAttributes<HTMLButtonElement>) {
  const [theme, setTheme] = useState<keyof typeof COLORS>('light');

  useEffect(() => {
    // first we check local storage, then fall back to system preferences until falling back to default 'light'
    // in the end we sanitize the strings as who knows what systems give us what...
    const detectedTheme =
      (localStorage.getItem('theme') ||
        (AUTO_DETECT && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
        'light') === 'dark'
        ? 'dark'
        : 'light';
    setTheme(detectedTheme);
    localStorage.setItem('theme', detectedTheme);

    const changer = (event: { matches: boolean }) => {
      const detectedTheme = event.matches ? 'dark' : 'light';
      setTheme(detectedTheme);
      localStorage.setItem('theme', detectedTheme);
    };

    if (AUTO_DETECT) window.matchMedia('(prefers-color-scheme: dark)').addListener(changer);
    return () => {
      if (AUTO_DETECT) window.matchMedia('(prefers-color-scheme: dark)').removeListener(changer);
    };
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
