import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M3 5L0 9h2v2h2V9h2L3 5z" />;

const ArrowSmallUpIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={6} viewBox="0 0 6 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowSmallUpIcon;
