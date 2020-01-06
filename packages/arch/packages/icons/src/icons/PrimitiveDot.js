import React from 'react';
import { style } from '../style';

const svgContent = (
  <path fillRule="evenodd" d="M0 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" />
);

const PrimitiveDotIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={8} viewBox="0 0 8 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default PrimitiveDotIcon;
