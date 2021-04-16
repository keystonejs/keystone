/** @jsx jsx */
import { jsx, Global } from '@keystone-ui/core';

import { COLORS } from '../lib/COLORS';

export function Theme() {
  return (
    <Global
      styles={{
        ':root': {
          ...COLORS,
          '--space-xxsmall': '0.375rem',
          '--space-xsmall': '0.5rem',
          '--space-small': '0.75rem',
          '--space-medium': '1rem',
          '--space-large': '1.5rem',
          '--space-xlarge': '3rem',
          '--space-xxlarge': '6rem',
          '--font-body':
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
          '--font-mono': '"Source Code Pro", monospace',
          '--wrapper-width': '67rem',
        },
      }}
    />
  );
}
