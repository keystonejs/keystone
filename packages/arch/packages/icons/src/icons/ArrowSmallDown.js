import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M4 7V5H2v2H0l3 4 3-4H4z" />;

const ArrowSmallDownIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={6} viewBox="0 0 6 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowSmallDownIcon;
