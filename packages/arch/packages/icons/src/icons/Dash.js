// @flow
import React from 'react';

const DashIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M0 7v2h8V7H0z" />
    </svg>
  );
};

DashIcon.defaultProps = {
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

export default DashIcon;
