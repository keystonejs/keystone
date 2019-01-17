// @flow
import React from 'react';

const ChevronRightIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M7.5 8l-5 5L1 11.5 4.75 8 1 4.5 2.5 3l5 5z" />
    </svg>
  );
};

ChevronRightIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 8,
  viewBox: '0 0 8 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default ChevronRightIcon;
