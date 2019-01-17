// @flow
import React from 'react';

const UnfoldIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        d="M11.5 7.5L14 10c0 .55-.45 1-1 1H9v-1h3.5l-2-2h-7l-2 2H5v1H1c-.55 0-1-.45-1-1l2.5-2.5L0 5c0-.55.45-1 1-1h4v1H1.5l2 2h7l2-2H9V4h4c.55 0 1 .45 1 1l-2.5 2.5zM6 6h2V3h2L7 0 4 3h2v3zm2 3H6v3H4l3 3 3-3H8V9z"
      />
    </svg>
  );
};

UnfoldIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 14,
  viewBox: '0 0 14 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default UnfoldIcon;
