import React from 'react';
import { style } from '../style';

const svgContent = (
  <path d="M1 1h7.5l2 2H9L8 2H1v12h10v-1h1v1c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1zm9 6h3v1h-3V7zm2 2h-2v1h2V9zM8.583 4h4.375L15 6v5.429a.58.58 0 01-.583.571H8.583A.58.58 0 018 11.429V10h1v1h5V6.5L12.5 5H9v1H8V4.571A.58.58 0 018.583 4zM9.5 7H6.667V5l-4 3 4 3V9H9.5V7z" />
);

const DependentIcon = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={16} width={16} viewBox="0 0 16 16" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default DependentIcon;
