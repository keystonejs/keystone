import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M6 3L0 8l6 5v-3h4V6H6V3z" />;

const ArrowLeftIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={10} viewBox="0 0 10 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowLeftIcon;
