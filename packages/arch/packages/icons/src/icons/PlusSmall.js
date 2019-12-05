import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M4 4H3v3H0v1h3v3h1V8h3V7H4V4z" />;

const PlusSmallIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={7} viewBox="0 0 7 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default PlusSmallIcon;
