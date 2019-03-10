import React, { useEffect, memo } from 'react';
import { Prompt } from 'react-router-dom';

export default memo(function PreventNavigation() {
  // to handle when the user closes the tab, does an actual browser navigation away or etc.
  useEffect(() => {
    const handler = event => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);
  // to handle the user clicking a react-router Link
  return <Prompt when message="This page has unsaved data. Are you sure you want to leave?" />;
});
