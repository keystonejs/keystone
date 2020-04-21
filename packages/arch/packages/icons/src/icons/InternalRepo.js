import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M10 0H9v1a1 1 0 00-1 1H7a1 1 0 00-1 1v1H1c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h1v1l1-.5 1 .5v-1h4c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1H7V3h1a1 1 0 001-1h1a1 1 0 001 1h1v13h1V3a1 1 0 00-1-1h-1a1 1 0 00-1-1V0zM8 12H2V5h6v7zm-7 1h1v1H1v-1zm7 0v1H4v-1h4zm3-9h-1v2h1V4zm0 3h-1v2h1V7zm0 3h-1v2h1v-2zm0 3h-1v2h1v-2zm-7-2H3v-1h1v1zm0-5H3v1h1V6zm0 2H3v1h1V8z"
  />
);

const InternalRepoIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={13} viewBox="0 0 13 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default InternalRepoIcon;
