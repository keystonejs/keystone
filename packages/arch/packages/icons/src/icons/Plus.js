
// @flow
import React from 'react';

const PlusIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M12 9H7v5H5V9H0V7h5V2h2v5h5v2z"/>
    </svg>
  );
};

PlusIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 12,
  viewBox: '0 0 12 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default PlusIcon;
