import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M5.79 11.624l-1.326-.088-.088-1.326 5.834-5.834 1.326.088.088 1.326-5.834 5.834zM8 15A7 7 0 108 1a7 7 0 000 14zm5.5-7a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"
  />
);

const SkipIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default SkipIcon;
