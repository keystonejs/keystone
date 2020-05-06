const template = ({ componentName, height, width, viewBox, svgContents }) =>
  `
import React from 'react';
import { style } from '../style';

const svgContent = ${svgContents};

const ${componentName} = React.memo(({ title, ...props }) => {
  return (
    <svg aria-hidden height={${height}} width={${width}} viewBox="${viewBox}" style={style} {...props}>
      {title ? <title>{title}</title> : null}
      {svgContent}
    </svg>
  );
});

export default ${componentName};
`.trim() + '\n';

module.exports = template;
