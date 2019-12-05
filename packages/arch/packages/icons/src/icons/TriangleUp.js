import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M12 11L6 5l-6 6h12z" />;

const TriangleUpIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={12} viewBox="0 0 12 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default TriangleUpIcon;
