const template = ({ componentName, height, width, viewBox, svgContents }) =>
  `
// @flow
import React from 'react';
import { style } from '../style';

const svgContent = ${svgContents};

const ${componentName} = React.memo<{ title?: string }>(({ title, ...props }) => {
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
