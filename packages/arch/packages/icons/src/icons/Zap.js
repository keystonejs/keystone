import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M10 7H6l3-7-9 9h4l-3 7 9-9z" />;

const ZapIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={10} viewBox="0 0 10 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ZapIcon;
