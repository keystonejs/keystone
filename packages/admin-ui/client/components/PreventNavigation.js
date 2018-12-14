import React, { useEffect } from 'react';
import { Prompt } from 'react-router';

export default function PreventNavigation() {
  useEffect(() => {
    const handler = event => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);
  return <Prompt when message="This page has unsaved data. Are you sure you want to leave?" />;
}
