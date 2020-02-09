import { Children, useEffect } from 'react';
import { useAdminMeta } from '../providers/AdminMeta';

const DocTitle = ({ children }) => {
  const { name } = useAdminMeta();
  const text = Children.toArray(children).join('');
  const title = `${text} - ${name}`;

  useEffect(() => {
    document.title = title;
  }), [title];

  return null;
};

export default DocTitle;
