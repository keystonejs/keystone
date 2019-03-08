import { useEffect, memo } from 'react';

import { withRouter } from '../providers/Router';

const confirmMessage = 'This page has unsaved data. Are you sure you want to leave?';

export default withRouter(
  memo(function PreventNavigation({ router }) {
    // to handle when the user closes the tab, does an actual browser navigation away or etc.
    useEffect(() => {
      // Prevent browser unload events
      const unloadHandler = event => {
        event.preventDefault();
        return confirmMessage;
      };
      window.addEventListener('beforeunload', unloadHandler);

      // Prevent clicking back/forward between client-side pages
      router.beforePopState(() => window.confirm(confirmMessage));

      // Prevent changing route when clicking a Next Route link
      const routeHandler = () => {
        if (!window.confirm(confirmMessage)) {
          throw new Error('Route change aborted.');
        }
      };
      router.events.on('routeChangeStart', routeHandler);

      // Restore everythign when this component is unmounted
      return () => {
        window.removeEventListener('beforeunload', unloadHandler);
        router.events.off('routeChangeStart', routeHandler);
        router.beforePopState(() => true);
      };
    }, []);
    return null;
  })
);
