import React from 'react';
import { style } from '../style';

const svgContent = <path fillRule="evenodd" d="M12 9H7v5H5V9H0V7h5V2h2v5h5v2z" />;

const PlusIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={12} viewBox="0 0 12 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default PlusIcon;
