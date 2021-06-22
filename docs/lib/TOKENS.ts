export const SPACE = {
  '--space-xxsmall': '0.125rem',
  '--space-xsmall': '0.25rem',
  '--space-small': '0.375rem',
  '--space-medium': '0.5rem',
  '--space-large': '1rem',
  '--space-xlarge': '1.5rem',
  '--space-xxlarge': '6rem',
} as const;

export const TYPE = {
  '--font-brand':
    '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  '--font-body':
    'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  '--font-mono':
    'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
} as const;

export const TYPESCALE = {
  '--font-xxsmall': '0.75rem',
  '--font-xsmall': '0.875rem',
  '--font-small': '1rem',
  '--font-medium': '1.25rem',
  '--font-large': '1.5rem',
  '--font-xlarge': '1.875rem',
  '--font-xxlarge': '2.625rem',
} as const;

export const COLORS = {
  light: {
    '--theme': 'light',
    '--app-bg': '#fff',
    '--brand-bg': '#166bff',
    '--brand-bg-90': '#2d7aff',
    '--brand-bg--40': 'rgba(22, 107, 255, 0.6)',

    '--brand-text': '#fff',
    '--link': '#166bff',
    '--link-active': '#0b55d5',
    '--focus': '#8b5cf6',
    '--border': '#e2e8f0',
    '--muted': '#627693',
    '--text': '#47546b',
    '--text-heading': '#2d3748',
    '--text-disabled': '#cbd5e0',
    '--code': '#47546b',
    '--code-bg': '#f6f7f9',

    '--info': '#0299e7',
    '--info-bg': 'rgba(2, 153, 231, 0.1)',
    '--warning': '#d97706',
    '--warning-bg': 'rgba(217, 119, 6, 0.1)',
    '--success': '#22c55e',
    '--success-bg': 'rgba(34, 197, 94, 0.1)',
    '--danger': '#dc2626',
    '--danger-bg': 'rgba(220, 38, 38, 0.1)',
    '--danger-90': '#e03c3c',
    '--danger--40': 'rgba(220, 38, 38, 0.6)',
    '--alert-text': '#47546b',

    '--grad1-1': '#166bff',
    '--grad1-2': '#22d3ee',
    '--grad2-1': '#10b981',
    '--grad2-2': '#22d3ee',
    '--grad3-1': '#da5a99',
    '--grad3-2': '#6373f1',
    '--grad4-1': '#f87171',
    '--grad4-2': '#f59e0b',
    '--grad5-1': '#ec4899',
    '--grad5-2': '#f87171',
  },
  dark: {
    '--theme': 'dark',
    '--app-bg': '#171923',
    '--brand-bg': '#166bff',
    '--brand-bg-90': '#2d7aff',
    '--brand-bg--40': 'rgba(22, 107, 255, 0.6)',

    '--brand-text': '#fff',
    '--link': '#5993f8',
    '--link-active': '#89b3fa',
    '--focus': '#8b5cf6',
    '--border': '#2d3748',
    '--muted': '#a0aec0',
    '--text': '#a0aec0',
    '--text-heading': '#f7f9fc',
    '--text-disabled': '#2d3748',
    '--code': '#cbd5e0',
    '--code-bg': '#2d3748',

    '--info': '#0299e7',
    '--info-bg': 'rgba(2, 153, 231, 0.05)',
    '--warning': '#d97706',
    '--warning-bg': 'rgba(217, 119, 6, 0.05)',
    '--success': '#22c55e',
    '--success-bg': 'rgba(34, 197, 94, 0.05)',
    '--danger': '#dc2626',
    '--danger-bg': 'rgba(220, 38, 38, 0.05)',
    '--danger-90': '#e03c3c',
    '--danger--40': 'rgba(220, 38, 38, 0.6)',
    '--alert-text': 'rgba(247, 250, 252, 0.8)',

    '--grad1-1': '#fff',
    '--grad1-2': '#fff',
    '--grad2-1': '#334561',
    '--grad2-2': '#7a869a',
    '--grad3-1': '#334561',
    '--grad3-2': '#7a869a',
    '--grad4-1': '#334561',
    '--grad4-2': '#7a869a',
    '--grad5-1': '#334561',
    '--grad5-2': '#7a869a',
  },
} as const;
