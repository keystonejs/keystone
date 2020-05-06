import React from 'react';
import { style } from '../style';

const svgContent = (
  <path
    fillRule="evenodd"
    d="M14.822.854a.5.5 0 10-.707-.708l-2.11 2.11C10.89 1.483 9.565.926 8.06.926c-5.06 0-8.06 6-8.06 6s1.162 2.323 3.258 4.078l-2.064 2.065a.5.5 0 10.707.707L14.822.854zM4.86 9.403L6.292 7.97A1.999 1.999 0 016 6.925c0-1.11.89-2 2-2 .384 0 .741.106 1.045.292l1.433-1.433A3.98 3.98 0 008 2.925c-2.2 0-4 1.8-4 4 0 .938.321 1.798.859 2.478zm7.005-3.514l1.993-1.992A14.873 14.873 0 0116 6.925s-3 6-7.94 6a6.609 6.609 0 01-2.661-.57l1.565-1.566c.33.089.678.136 1.036.136 2.22 0 4-1.78 4-4 0-.358-.047-.705-.136-1.036zM9.338 8.415l.152-.151a1.996 1.996 0 01-.152.151z"
  />
);

const EyeClosedIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={14} width={16} viewBox="0 0 16 14" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default EyeClosedIcon;
