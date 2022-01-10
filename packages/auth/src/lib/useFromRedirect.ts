import { useMemo } from 'react';
import { useRouter } from '@keystone-6/core/admin-ui/router';

export const useRedirect = () => {
  const router = useRouter();
  const redirect = useMemo(
    () =>
      !Array.isArray(router.query.from) && router.query.from?.startsWith('/')
        ? router.query.from
        : '/',
    [router]
  );

  return redirect;
};
