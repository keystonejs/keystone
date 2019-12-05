import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M10 10l-1.5 1.5L5 7.75 1.5 11.5 0 10l5-5 5 5z" />;

const ChevronUpIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={10} viewBox="0 0 10 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ChevronUpIcon;
