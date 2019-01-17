// @flow
import React from 'react';

const DeviceMobileIcon = ({ title, ...props }: { title?: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        d="M9 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM5 15.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zM9 12H1V2h8v10z"
      />
    </svg>
  );
};

DeviceMobileIcon.defaultProps = {
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

export default DeviceMobileIcon;
