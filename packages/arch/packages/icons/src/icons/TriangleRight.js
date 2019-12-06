import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M0 14l6-6-6-6v12z" />;

const TriangleRightIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={6} viewBox="0 0 6 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default TriangleRightIcon;
