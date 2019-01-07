import React from 'react';
import reactAddonsTextContent from 'react-addons-text-content';
import snakeCase from 'lodash.snakecase';

function dashcase(children) {
  // this matches the IDs that are used for links naturally by remark
  return snakeCase(reactAddonsTextContent(children)).replace(/_/g, '-');
}

export default props => {
  const Tag = props.tag;
  return <Tag id={dashcase(props.children)}>{props.children}</Tag>;
};
