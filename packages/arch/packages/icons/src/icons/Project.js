
// @flow
import React from 'react';

const ProjectIcon = ({ title, ...props }: { title: string }) => {
  return (
    <svg {...props}>
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d="M10 12h3V2h-3v10zm-4-2h3V2H6v8zm-4 4h3V2H2v12zm-1 1h13V1H1v14zM14 0H1a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V1a1 1 0 0 0-1-1z"/>
    </svg>
  );
};

ProjectIcon.defaultProps = {
  'aria-hidden': true,
  height: 16,
  width: 15,
  viewBox: '0 0 15 16',
  style: {
    display: 'inline-block',
    verticalAlign: 'text-top',
    fill: 'currentColor',
  },
};

export default ProjectIcon;
