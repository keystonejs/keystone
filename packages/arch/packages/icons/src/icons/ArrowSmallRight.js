import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M6 8L2 5v2H0v2h2v2l4-3z" />;

const ArrowSmallRightIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={6} viewBox="0 0 6 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowSmallRightIcon;
