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

export default function Loading({ color, isCentered, size }) {
  const sizePx = SIZE_MAP[size];

  return (
    <div css={isCentered ? centerStyles(sizePx) : null}>
      <svg
        version="1.1"
        id="loader-1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width={`${sizePx}px`}
        height={`${sizePx}px`}
        viewBox="0 0 40 40"
        enableBackground="new 0 0 40 40"
        xmlSpace="preserve"
      >
        <path
          opacity="0.2"
          fill={color}
          d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946 s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634 c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"
        />
        <path
          fill={color}
          d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0 C22.32,8.481,24.301,9.057,26.013,10.047z"
          transform="rotate(28.1794 20 20)"
        >
          <animateTransform
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="0 20 20"
            to="360 20 20"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}

Loading.propTypes = {
  color: PropTypes.string,
  isCentered: PropTypes.bool,
  size: PropTypes.oneOf(Object.keys(SIZE_MAP)),
};
Loading.defaultProps = {
  color: 'currentColor',
  isCentered: false,
  size: 'medium',
};

const centerStyles = width => ({
  lineHeight: 10,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: '3em',
  width,
});
