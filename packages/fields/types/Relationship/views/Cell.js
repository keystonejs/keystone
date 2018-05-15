import React from 'react';
import renderTemplate from '@keystonejs/ui/src/template';

export default ({ data, field }) => {
  const refList = field.adminMeta.getListByKey(field.config.ref);
  return (
    <span>{renderTemplate({ template: refList.displayTemplate, data })}</span>
  );
};
