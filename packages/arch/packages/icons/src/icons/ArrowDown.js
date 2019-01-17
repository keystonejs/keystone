// @flow
import React from 'react';

const ArrowDownIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M7 7V3H3v4H0l5 6 5-6H7z" />
    </svg>
  );
};

ArrowDownIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 10,
  viewBox: '0 0 10 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default ArrowDownIcon;
