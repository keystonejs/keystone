import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M4 7V5L0 8l4 3V9h2V7H4z" />;

const ArrowSmallLeftIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={6} viewBox="0 0 6 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowSmallLeftIcon;
