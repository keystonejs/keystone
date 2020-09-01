/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx } from '@emotion/core';

// BASE
// ------------------------------

const Svg = ({ color = 'currentColor', size = 24, stroke = 2, ...props }) => (
  <svg
    fill="none"
    height={size}
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={stroke}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  />
);
Svg.propTypes = {
  color: PropTypes.string,
  size: PropTypes.number,
  stroke: PropTypes.number,
};

// Icons
// https://feathericons.com
// ------------------------------

export const AlertIcon = props => (
  <Svg {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12" y2="17" />
  </Svg>
);
export const CheckmarkIcon = props => (
  <Svg {...props}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);
export const MicrophoneIcon = props => (
  <Svg {...props}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </Svg>
);
export const PinIcon = props => (
  <Svg {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);
export const SignoutIcon = props => (
  <Svg {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);
export const UserIcon = props => (
  <Svg {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);
export const XIcon = props => (
  <Svg {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);
