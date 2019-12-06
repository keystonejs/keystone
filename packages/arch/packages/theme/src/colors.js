import { lighten, darken, alpha } from '@arch-ui/color-utils';

// colors with intention
const intent = {
  create: '#34c240',
  danger: '#d64242',
  info: '#0090e0',
  primary: '#2684FF',
  warning: '#fa9f47',
};

// neutrals
const neutrals = {
  N05: '#F4F5F7',
  N10: '#EBECF0',
  N15: '#DFE1E5',
  N20: '#C1C7D0',
  N30: '#A5ADBA',
  N40: '#97A0AF',
  N50: '#7A869A',
  N60: '#6C798F',
  N70: '#42526E',
  N80: '#253858',
  N90: '#172B4D',
  N100: '#091E42',
};

const source = Array.from(new Array(19), (item, index) => (index + 1) * 5);
const darkenSource = source.slice(0, 16).reverse(); // darker than D80 is basically black...

function makeVariants(color) {
  const variants = {};
  source.forEach(n => (variants[`L${n}`] = lighten(color, n)));
  variants.base = color;
  darkenSource.forEach(n => (variants[`D${n}`] = darken(color, n)));
  source.forEach(n => (variants[`A${n}`] = alpha(color, n / 100)));
  return variants;
}

const blue = '#2684FF';
const green = '#34c240';
const red = '#d64242';
const yellow = '#fa9f47';
// const neutral = '#7A869A';

const blues = makeVariants(blue);
const greens = makeVariants(green);
const reds = makeVariants(red);
const yellows = makeVariants(yellow);
// const neutrals = makeVariants(neutral);

export default {
  R: reds,
  G: greens,
  B: blues,
  Y: yellows,
  ...neutrals,

  // named
  page: '#FAFBFC',
  text: neutrals.N90,
  ...intent,
  green,
  red,
  blue,
  yellow,
};
