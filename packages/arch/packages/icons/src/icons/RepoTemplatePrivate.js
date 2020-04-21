import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M12 6c0-.55-.45-1-1-1h-1V4c0-2.2-1.8-4-4-4S2 1.8 2 4v1H1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h5v-1H2V6h9v2h1V6zM8.21 5V4c0-1.22-.98-2.2-2.2-2.2-1.22 0-2.2.98-2.2 2.2v1h4.4zM12 12h2v2h-2v2h-2v-2H8v-2h2v-2h2v2zm-9 0h1v-1H3v1zm0-5h1v1H3V7zm1 2H3v1h1V9z"
  />
);

const RepoTemplatePrivateIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={14} viewBox="0 0 14 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default RepoTemplatePrivateIcon;
