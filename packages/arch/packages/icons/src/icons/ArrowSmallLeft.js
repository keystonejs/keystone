// @flow
import React from 'react';

const ArrowSmallLeftIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M4 7V5L0 8l4 3V9h2V7H4z" />
    </svg>
  );
};

ArrowSmallLeftIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 6,
  viewBox: '0 0 6 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default ArrowSmallLeftIcon;
