import { useEffect } from 'react';
import { useAdminMeta } from '../providers/AdminMeta';

const DocTitle = ({ title }) => {
  const { name } = useAdminMeta();

  useEffect(() => {
    document.title = `${title} — ${name}`;
  }, [title]);

  return null;
};

export default DocTitle;
