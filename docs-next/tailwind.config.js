const colors = require('tailwindcss/colors');
const hintSafelist = require('./remark-plugins/hints').safelist;

const preserveColors = ['gray', 'orange', 'pink', 'blue', 'green'];

module.exports = {
  purge: {
    enabled: true,
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    options: {
      safelist: [
        ...preserveColors.map(i => `bg-${i}-100`),
        ...preserveColors.map(i => `text-${i}-700`),
        ...hintSafelist,
      ],
    },
  },
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
  },
};
