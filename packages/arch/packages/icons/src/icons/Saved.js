import React from 'react';
import { style } from '../style';

const svgContent = (
  <path fillRule="evenodd" d="M12 0H4c-.73 0-1 .27-1 1v15l5-3.09L13 16V1c0-.73-.27-1-1-1z" />
);

const SavedIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default SavedIcon;
