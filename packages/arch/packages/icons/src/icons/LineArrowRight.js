import React from 'react';
import { style } from '../style';

const svgContent = <path d="M7.5 11.5L9 13l5-5-5-5-1.5 1.5L10.179 7H2v2h8.179L7.5 11.5z" />;

const LineArrowRightIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default LineArrowRightIcon;
