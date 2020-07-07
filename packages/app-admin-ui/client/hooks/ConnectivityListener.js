import React, { useState, useEffect, useRef } from 'react';
import { useToasts } from 'react-toast-notifications';

export const useConnectivityListener = () => {
  const [isOnline, setIsOnline] = useState(window ? window.navigator.onLine : false);

  const offlineToastId = useRef(null);
  const isInitialMount = useRef(true);

  const { addToast, removeToast } = useToasts();

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener('online', online, false);
    window.addEventListener('offline', offline, false);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    // Don't add a toast on mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // prepare the content
    const content = (
      <div>
        <strong>{isOnline ? 'Online' : 'Offline'}</strong>
        <div>{isOnline ? 'Editing is available again' : 'Changes you make may not be saved'}</div>
      </div>
    );

    // remove the existing offline notification if it exists, otherwise store
    // the added toast id for use later
    const callback = id => {
      if (isOnline && offlineToastId.current !== null) {
        removeToast(offlineToastId.current);
        offlineToastId.current = null;
      } else {
        offlineToastId.current = id;
      }
    };

    // add the applicable toast
    addToast(content, { appearance: 'info', autoDismiss: isOnline }, callback);
  }, [isOnline]);
};
