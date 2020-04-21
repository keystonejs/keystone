import React from 'react';
import { style } from '../style';

const svgContent = (
  <path d="M6.5 0L0 1.875v5.644C0 11.897 4.93 15 6.5 15c.63 0 1.8-.5 2.976-1.38l-.663-.663C7.889 13.625 6.996 14 6.5 14 5.172 14 1 11.31 1 7.516V2.625L6.5 1 12 2.625v4.23l.48.48.52-.52v-4.94L6.5 0zm5.98 8.75L10.73 7 9.25 8.48 11 10.23l-1.75 1.75 1.48 1.48 1.75-1.75 1.75 1.75 1.48-1.48-1.75-1.75 1.75-1.75L14.23 7l-1.75 1.75zM2 3.375L6.5 2v11C5.414 13 2 10.724 2 7.514V3.375z" />
);

const ShieldXIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ShieldXIcon;
