// @flow
import React from 'react';

const ArrowSmallUpIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M3 5L0 9h2v2h2V9h2L3 5z" />
    </svg>
  );
};

ArrowSmallUpIcon.defaultProps = {
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

export default ArrowSmallUpIcon;
