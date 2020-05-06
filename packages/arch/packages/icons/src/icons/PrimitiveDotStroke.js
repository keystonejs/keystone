import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M4 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4 12a4 4 0 100-8 4 4 0 000 8z"
  />
);

const PrimitiveDotStrokeIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={8} viewBox="0 0 8 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default PrimitiveDotStrokeIcon;
