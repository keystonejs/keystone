import React from 'react';
import { style } from '../style';

const svgContent = <path d="M11.5 8.5L13 7 8 2 3 7l1.5 1.5L7 5.821V14h2V5.821L11.5 8.5z" />;

const LineArrowUpIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default LineArrowUpIcon;
