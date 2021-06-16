/** @jsx jsx */
import { jsx, Global } from '@keystone-ui/core';
import { useState, useEffect } from 'react';

import { COLORS, SPACE, TYPE, TYPESCALE } from '../lib/TOKENS';

export function Theme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // we duplicate the logic of DarkModeBtn here so the flash is shorter
    const detectedTheme =
      (localStorage.getItem('theme') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches ||
        'light') === 'dark'
        ? 'dark'
        : 'light';
    localStorage.setItem('theme', detectedTheme);

    if (detectedTheme !== 'light') {
      setTheme(detectedTheme);
    }
  });

  return (
    <Global
      styles={{
        ':root': {
          ...COLORS[theme],
          ...SPACE,
          ...TYPE,
          ...TYPESCALE,
          '--wrapper-width': '90rem',
        },
      }}
    />
  );
}
