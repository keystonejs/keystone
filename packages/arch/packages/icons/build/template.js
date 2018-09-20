const template = ({ componentName, height, width, viewBox, ariaHidden, svgContents }) => `
import React, { Component } from 'react';

class ${componentName} extends Component {
  render() {
    var defaults = {
      'aria-hidden': ${ariaHidden},
      height: ${height},
      width: ${width},
      viewBox: '${viewBox}',
      style: {
        display: 'inline-block',
        verticalAlign: 'text-top',
        fill: 'currentColor',
      },
    };
    const { title, ...props } = this.props;
    return (
      <svg {...defaults} {...props}>
        {title ? <title>{title}</title> : null}
        ${svgContents}
      </svg>
    );
  }
}
export default ${componentName};
`;

module.exports = template;
