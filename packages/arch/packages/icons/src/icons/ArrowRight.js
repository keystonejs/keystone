import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M10 8L4 3v3H0v4h4v3l6-5z" />;

const ArrowRightIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={10} viewBox="0 0 10 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowRightIcon;
