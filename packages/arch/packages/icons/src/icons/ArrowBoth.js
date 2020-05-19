import React from 'react';
import { style } from '../style';

const svgContent = <path d="M0 8l6-5v3h8V3l6 5-6 5v-3H6v3L0 8z" />;

const ArrowBothIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={20} viewBox="0 0 20 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ArrowBothIcon;
