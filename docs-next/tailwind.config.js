const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      gray: colors.blueGray,
      blue: colors.lightBlue,
      red: colors.red,
      amber: colors.amber,
      orange: colors.orange,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      lightblue: colors.lightBlue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fushia: colors.fushia,
      rose: colors.rose,
      pink: colors.pink,
      yellow: colors.amber,
    },
    extend: {
      typography: theme => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            'blockquote p:first-of-type::before': {
              content: '',
            },
            'blockquote p:last-of-type::after': {
              content: '',
            },
            pre: {
              color: theme('colors.gray.800'),
              // backgroundColor: '#F9FAFB', // theme('colors.gray.100'),
              backgroundColor: theme('colors.gray.50'),
              border: `1px solid ${theme('colors.gray.100')}`,
              overflowX: 'auto',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
