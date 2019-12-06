import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M8 12H0V4h8v8z" />;

const PrimitiveSquareIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={8} viewBox="0 0 8 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default PrimitiveSquareIcon;
