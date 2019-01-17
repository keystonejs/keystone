
// @flow
import React from 'react';

const PlusSmallIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M4 4H3v3H0v1h3v3h1V8h3V7H4V4z"/>
    </svg>
  );
};

PlusSmallIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 7,
  viewBox: '0 0 7 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default PlusSmallIcon;
