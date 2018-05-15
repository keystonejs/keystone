import React from 'react';
import renderTemplate from '@keystonejs/ui/src/template';

export default ({ data, field, Link }) => {
  const refList = field.adminMeta.getListByKey(field.config.ref);
  return (
    <Link path={refList.path} id={data.id}>
      {renderTemplate({ template: refList.displayTemplate, data })}
    </Link>
  );
};
