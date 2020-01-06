import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M5 3L0 9h3v4h4V9h3L5 3z" />;

const ArrowUpIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={10} viewBox="0 0 10 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowUpIcon;
