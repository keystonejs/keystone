import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M8 4v1H0V4h8zM0 8h8V7H0v1zm0 3h8v-1H0v1z" />;

const GrabberIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={8} viewBox="0 0 8 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default GrabberIcon;
