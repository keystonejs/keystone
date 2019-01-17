
// @flow
import React from 'react';

const ChevronUpIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M10 10l-1.5 1.5L5 7.75 1.5 11.5 0 10l5-5 5 5z"/>
    </svg>
  );
};

ChevronUpIcon.defaultProps = {
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

export default ChevronUpIcon;
