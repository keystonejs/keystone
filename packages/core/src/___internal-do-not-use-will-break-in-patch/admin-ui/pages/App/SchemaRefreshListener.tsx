import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function SchemaRefreshListener() {
  const router = useRouter();

  useEffect(() => {
    // Only connect in development mode
    if (process.env.NODE_ENV !== 'development') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}/__keystone/schema-refresh`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'SCHEMA_CHANGED') {
        // Reload the page to reflect schema changes
        router.reload();
      }
    };

    return () => {
      socket.close();
    };
  }, [router]);

  return null;
}
