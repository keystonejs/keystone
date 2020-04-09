/** @jsx jsx */

import { jsx } from '@emotion/core';
import PropTypes from 'prop-types';

const SIZE_MAP = {
  xsmall: 24,
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 72,
};

export default function Loading({ color = 'currentColor', isCentered = false, size = 'medium' }) {
  const sizePx = SIZE_MAP[size];

  return (
    <div css={isCentered ? centerStyles(sizePx) : null}>
      <svg
        fill="none"
        fillRule="evenodd"
        height={`${sizePx}px`}
        stroke={color}
        strokeWidth="2"
        viewBox="0 0 38 38"
        width={`${sizePx}px`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(1 1)">
          <circle strokeOpacity="0.2" cx="18" cy="18" r="18" />
          <path d="M36 18c0-9.94-8.06-18-18-18" transform="rotate(36.3715 18 18)">
            <animateTransform
              attributeName="transform"
              dur="0.66s"
              from="0 18 18"
              repeatCount="indefinite"
              to="360 18 18"
              type="rotate"
            />
          </path>
        </g>
      </svg>
    </div>
  );
}

Loading.propTypes = {
  color: PropTypes.string,
  isCentered: PropTypes.bool,
  size: PropTypes.oneOf(Object.keys(SIZE_MAP)),
};

const centerStyles = width => ({
  lineHeight: 10,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: '3em',
  width,
});
