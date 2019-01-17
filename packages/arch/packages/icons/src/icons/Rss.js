
// @flow
import React from 'react';

const RssIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M2 13H0v-2c1.11 0 2 .89 2 2zM0 3v1a9 9 0 0 1 9 9h1C10 7.48 5.52 3 0 3zm0 4v1c2.75 0 5 2.25 5 5h1c0-3.31-2.69-6-6-6z"/>
    </svg>
  );
};

RssIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 10,
  viewBox: '0 0 10 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default RssIcon;
