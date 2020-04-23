import React from 'react';
import { style } from '../style';

const svgContent = <path d="M8.5 4.5L7 3 2 8l5 5 1.5-1.5L5.821 9H14V7H5.821L8.5 4.5z" />;

const LineArrowLeftIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default LineArrowLeftIcon;
