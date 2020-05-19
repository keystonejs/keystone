import React from 'react';
import { style } from '../style';

const svgContent = <path d="M4.5 7.5L3 9l5 5 5-5-1.5-1.5L9 10.179V2H7v8.179L4.5 7.5z" />;

const LineArrowDownIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default LineArrowDownIcon;
