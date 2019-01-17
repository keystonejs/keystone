// @flow
import React from 'react';

const ChevronLeftIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M5.5 3L7 4.5 3.25 8 7 11.5 5.5 13l-5-5 5-5z" />
    </svg>
  );
};

ChevronLeftIcon.defaultProps = {
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

export default ChevronLeftIcon;
