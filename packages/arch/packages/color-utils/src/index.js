// Validate Hex
// ==============================

function validateHex(color) {
  const hex = color.replace('#', '');

  if (hex.length === 3) {
    return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error(`Invalid color value provided: "${color}"`);
  }

  return hex;
}

// Hex to RGB Obj
// ==============================

function hexToRgb(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

// String to RGB
// ==============================

function stringToRGB(color) {
  const tuple = color
    .substring(4, color.length - 1)
    .replace(/ /g, '')
    .split(',');

  const r = parseInt(tuple[0], 10);
  const g = parseInt(tuple[1], 10);
  const b = parseInt(tuple[2], 10);

  return { r, g, b };
}

// Hex or RGB string to RGB Obj
// ==============================

function anyToRGB(color) {
  const isRgbString = color.length > 7;

  if (isRgbString) {
    return stringToRGB(color);
  } else {
    const hex = validateHex(color);
    return hexToRgb(hex);
  }
}

// To RGB string
// ==============================

function toRgbString({ r, g, b, a }) {
  return a ? `rgba(${[r, g, b, a].join(',')})` : `rgb(${[r, g, b].join(',')})`;
}

// RGB with alpha channel
// ==============================

function alpha(color, opacity = 1) {
  const { r, g, b } = anyToRGB(color);

  return toRgbString({ r, g, b, a: opacity });
}

// Shade Color
// ==============================

const shader = (c, t, p) => Math.round((t - c) * p) + c;

function shade(color, percent) {
  const df = percent / 100; // decimal fraction
  const { r, g, b } = anyToRGB(color);
  const t = df < 0 ? 0 : 255;
  const p = Math.abs(df);

  return toRgbString({
    r: shader(r, t, p),
    g: shader(g, t, p),
    b: shader(b, t, p),
  });
}

// shade aliases
const lighten = shade;
function darken(color, percent) {
  return shade(color, percent * -1);
}

// Mix Colors
// ==============================

const mixer = (c1, c2, df) => Math.round((c2 - c1) * df) + c1;

function mix(color1, color2, percent) {
  const df = percent / 100; // decimal fraction
  const { r: r1, g: g1, b: b1 } = anyToRGB(color1);
  const { r: r2, g: g2, b: b2 } = anyToRGB(color2);

  return toRgbString({
    r: mixer(r1, r2, df),
    g: mixer(g1, g2, df),
    b: mixer(b1, b2, df),
  });
}

export { alpha, darken, lighten, mix };
