// @flow
import React from 'react';

const ArrowSmallRightIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M6 8L2 5v2H0v2h2v2l4-3z" />
    </svg>
  );
};

ArrowSmallRightIcon.defaultProps = {
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

export default ArrowSmallRightIcon;
