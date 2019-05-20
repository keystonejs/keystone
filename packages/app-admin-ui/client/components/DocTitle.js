// @flow

import React, { Children, type Node } from 'react';
import DocumentTitle from 'react-document-title';

import { withAdminMeta } from '../providers/AdminMeta';

type Props = {
  adminMeta: Object,
  children: Node,
};

const DocTitle = ({ adminMeta, children }: Props) => {
  const text = Children.toArray(children).join('');
  const title = `${text} - ${adminMeta.name}`;

  return <DocumentTitle title={title} />;
};

export default withAdminMeta(DocTitle);
