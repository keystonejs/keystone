
// @flow
import React from 'react';

const KebabHorizontalIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M1.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM13 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    </svg>
  );
};

KebabHorizontalIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 13,
  viewBox: '0 0 13 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default KebabHorizontalIcon;
