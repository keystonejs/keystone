import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M5.5 3L7 4.5 3.25 8 7 11.5 5.5 13l-5-5 5-5z" />;

const ChevronLeftIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={8} viewBox="0 0 8 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ChevronLeftIcon;
