import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M7 7V3H3v4H0l5 6 5-6H7z" />;

const ArrowDownIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={10} viewBox="0 0 10 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowDownIcon;
