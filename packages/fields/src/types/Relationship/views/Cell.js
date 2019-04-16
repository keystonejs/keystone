// @flow

import React, { Fragment } from 'react';
import type { CellProps } from '../../../types';

type Relationship = {
  id: string,
  _label_: string,
};

type Props = CellProps<Relationship | Array<Relationship>>;

export default ({ data, field, Link }: Props) => {
  if (!data) {
    return null;
  }
  const refList = field.adminMeta.getListByKey(field.config.ref);
  return (
    <Fragment>
      {(Array.isArray(data) ? data : [data])
        .filter(item => item)
        .map((item, index) => (
          <Fragment key={item.id}>
            {!!index ? ', ' : ''}
            <Link path={refList.path} id={item.id}>
              {item._label_}
            </Link>
          </Fragment>
        ))}
    </Fragment>
  );
};
