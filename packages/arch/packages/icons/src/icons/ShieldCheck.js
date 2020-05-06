import React from 'react';
import { style } from '../style';

const svgContent = (
  <path d="M6.5 0L0 1.875v5.644C0 11.897 4.93 15 6.5 15c.741 0 2.232-.692 3.6-1.884l-.713-.61C8.275 13.453 7.099 14 6.5 14 5.172 14 1 11.31 1 7.516V2.625L6.5 1 12 2.625v4.891c0 .128-.005.255-.014.38L13 6.713V1.875L6.5 0zm5 10l-2-1.5L8 10l3.5 3L16 8l-1.5-1.5-3 3.5zM2 3.375L6.5 2v11C5.414 13 2 10.724 2 7.514V3.375z" />
);

const ShieldCheckIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ShieldCheckIcon;
