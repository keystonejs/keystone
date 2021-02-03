function parseHex(hex: string) {
  let result = hex;

  // remove hash symbol
  if (result.startsWith('#')) {
    result = result.slice(1);
  }

  // resolve hex shortcuts
  if (result.length === 3) {
    result = result[0].repeat(2) + result[1].repeat(2) + result[2].repeat(2);
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hexToTriplet(dirtyHex: string, alpha?: number) {
  const cleanHex = parseHex(dirtyHex);

  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);

  return [r, g, b];
}

// values taken from contrast algorithms from w3
// https://www.w3.org/TR/AERT/#color-contrast
export function hexToRgb(dirtyHex: string, alpha?: number) {
  const [r, g, b] = hexToTriplet(dirtyHex);
  const value = `${r}, ${g}, ${b}`;

  if (alpha) {
    return `rgba(${value}, ${alpha})`;
  }

  return `rgb(${value})`;
}
