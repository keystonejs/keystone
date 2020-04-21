import React from 'react';
import { style } from '../style';

const svgContent = (
  <path d="M12 0H4c-.73 0-1 .27-1 1v1.982l10 5.774V1c0-.73-.27-1-1-1zm1 12.203l1.606.928.75-1.3-13.856-8-.75 1.3L3 6.43V16l5-3.09L13 16v-3.797z" />
);

const UnsavedIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default UnsavedIcon;
