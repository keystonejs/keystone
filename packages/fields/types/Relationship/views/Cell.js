import React, { Fragment } from 'react';
import renderTemplate from '@keystonejs/ui/src/template';

export default ({ data, field, Link }) => {
  if (!data) {
    return null;
  }
  const refList = field.adminMeta.getListByKey(field.config.ref);
  return (
    <Fragment>
      {(Array.isArray(data) ? data : [data])
        .filter(Boolean)
        .map((item, index) => (
          <Fragment key={item.id}>
            {!!index ? ', ' : ''}
            <Link path={refList.path} id={item.id}>
              {renderTemplate({
                template: refList.displayTemplate,
                data: item,
              })}
            </Link>
          </Fragment>
        ))}
    </Fragment>
  );
};
