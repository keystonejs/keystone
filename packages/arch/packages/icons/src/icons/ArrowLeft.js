
// @flow
import React from 'react';

const ArrowLeftIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M6 3L0 8l6 5v-3h4V6H6V3z"/>
    </svg>
  );
};

ArrowLeftIcon.defaultProps = {
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

export default ArrowLeftIcon;
