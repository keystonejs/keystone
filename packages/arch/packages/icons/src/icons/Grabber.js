
// @flow
import React from 'react';

const GrabberIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M8 4v1H0V4h8zM0 8h8V7H0v1zm0 3h8v-1H0v1z"/>
    </svg>
  );
};

GrabberIcon.defaultProps = {
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

export default GrabberIcon;
