import { hexToTriplet } from './hexToRgb';

export function getContrastText(color: string) {
  const [r, g, b] = hexToTriplet(color);

  // calculate contrast against grayscale
  var contrast = (Math.round(r * 299) + Math.round(g * 587) + Math.round(b * 114)) / 1000;

  return contrast >= 128 ? 'black' : 'white';
}
