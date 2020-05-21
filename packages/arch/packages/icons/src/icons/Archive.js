import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M13 2H1v2h12V2zM0 4a1 1 0 001 1v9a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 001-1V2a1 1 0 00-1-1H1a1 1 0 00-1 1v2zm2 1h10v9H2V5zm2 3h6V7H4v1z"
  />
);

const ArchiveIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={14} viewBox="0 0 14 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArchiveIcon;
