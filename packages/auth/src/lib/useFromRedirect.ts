import { useMemo } from 'react';
import { useRouter } from '@keystone-6/core/admin-ui/router';

export const useRedirect = () => {
  const router = useRouter();
  const redirect = useMemo(() => {
    const { from } = router.query;
    if (typeof from !== 'string') return '/';
    if (!from.startsWith('/')) return '/';
    if (from === '/no-access') return '/';

    return from;
  }, [router]);

  return redirect;
};
