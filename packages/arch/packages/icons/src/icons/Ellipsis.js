// @flow
import React from 'react';

const EllipsisIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        d="M11 5H1c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zM4 9H2V7h2v2zm3 0H5V7h2v2zm3 0H8V7h2v2z"
      />
    </svg>
  );
};

EllipsisIcon.defaultProps = {
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

export default EllipsisIcon;
