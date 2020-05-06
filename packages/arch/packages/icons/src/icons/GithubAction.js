import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M9 2h6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1H9a1 1 0 11-2 0H1c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1h6a1 1 0 112 0zm6 1v10H1V3h14zm-2.5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
  />
);

const GithubActionIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default GithubActionIcon;
