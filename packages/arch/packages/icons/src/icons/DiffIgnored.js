
// @flow
import React from 'react';

const DiffIgnoredIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M13 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 13H1V2h12v12zm-8.5-2H3v-1.5L9.5 4H11v1.5L4.5 12z"/>
    </svg>
  );
};

DiffIgnoredIcon.defaultProps = {
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

export default DiffIgnoredIcon;
