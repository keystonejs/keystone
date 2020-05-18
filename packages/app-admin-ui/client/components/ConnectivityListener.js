import React, { useState, useEffect, useRef } from 'react';
import { useToasts } from 'react-toast-notifications';

const ConnectivityListener = ({}) => {
  const [isOnline, setIsOnline] = useState(window ? window.navigator.onLine : false);

  const offlineToastId = useRef(null);
  const isInitialMount = useRef(true);

  const { addToast, removeToast } = useToasts();

  const online = () => setIsOnline(true);
  const offline = () => setIsOnline(false);

  useEffect(() => {
    window.addEventListener('online', online, false);
    window.addEventListener('offline', offline, false);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const onlineCallback = () => {
    if (offlineToastId.current !== null) {
      removeToast(offlineToastId.current);
      offlineToastId.current = null;
    }
  };

  const offlineCallback = id => {
    offlineToastId.current = id;
  };

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
    const callback = isOnline ? onlineCallback : offlineCallback;

    // add the applicable toast
    addToast(
      content,
      {
        appearance: 'info',
        autoDismiss: isOnline,
      },
      callback
    );
  }, [isOnline]);

  return null;
};

export default ConnectivityListener;
