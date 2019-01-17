// @flow
import React from 'react';

const TriangleRightIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M0 14l6-6-6-6v12z" />
    </svg>
  );
};

TriangleRightIcon.defaultProps = {
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

export default TriangleRightIcon;
