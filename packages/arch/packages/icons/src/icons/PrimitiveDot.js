// @flow
import React from 'react';

const PrimitiveDotIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M0 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" />
    </svg>
  );
};

PrimitiveDotIcon.defaultProps = {
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

export default PrimitiveDotIcon;
