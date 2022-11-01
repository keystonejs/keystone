/** @jsxRuntime classic */
/** @jsx jsx */
import { Fragment, useState, useEffect, HTMLAttributes } from 'react';
import { jsx } from '@emotion/react';

import { COLORS } from '../lib/TOKENS';
import { LightMode } from './icons/LightMode';
import { DarkMode } from './icons/DarkMode';

function ModeIcon({ theme }: { theme: 'light' | 'dark' }) {
  if (theme === 'dark') {
    return <LightMode css={{ height: 'var(--space-xlarge)' }} />;
  }

  return <DarkMode css={{ height: 'var(--space-xlarge)' }} />;
}

export function ThemeToggle(props: HTMLAttributes<HTMLButtonElement>) {
  /*
    We don't want to render the toggle during server rendering
    because Next will always server render the light mode toggle and hydrate the light mode toggle
    even if the theme is dark mode based on system preference.
    So we render the toggle only on the client
  */
  const [theme, setTheme] = useState<keyof typeof COLORS | null>(null);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
    setTheme(currentTheme);
  }, [setTheme]);

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <Fragment>
      <button
        key={theme}
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
        {theme === null ? <span css={{ width: 24 }} /> : <ModeIcon theme={theme} />}
      </button>
    </Fragment>
  );
}
