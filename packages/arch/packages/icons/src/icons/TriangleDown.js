import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M0 5l6 6 6-6H0z" />;

const TriangleDownIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={12} viewBox="0 0 12 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default TriangleDownIcon;
