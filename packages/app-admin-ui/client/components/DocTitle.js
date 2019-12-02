import React, { Children } from 'react';
import DocumentTitle from 'react-document-title';

import { withAdminMeta } from '../providers/AdminMeta';

const DocTitle = ({ adminMeta, children }) => {
  const text = Children.toArray(children).join('');
  const title = `${text} - ${adminMeta.name}`;

  return <DocumentTitle title={title} />;
};

export default withAdminMeta(DocTitle);
