import { Children, useEffect } from 'react';
import { withAdminMeta } from '../providers/AdminMeta';

const DocTitle = ({ adminMeta: { name }, children }) => {
  const text = Children.toArray(children).join('');
  const title = `${text} - ${name}`;

  useEffect(() => {
    document.title = title;
  });

  return null;
};

export default withAdminMeta(DocTitle);
