import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M0 7v2h8V7H0z" />;

const DashIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={8} viewBox="0 0 8 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default DashIcon;
