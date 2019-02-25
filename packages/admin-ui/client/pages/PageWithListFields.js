import React, { useState, useEffect, memo } from 'react';

import PageLoading from '../components/PageLoading';
import PageError from '../components/PageError';

// Wrapper to help with async loading of modules (dynamic imports) that are
// needed for the page to load
// TODO: Can this be done better with Suspense? They're not really components
// that we're loading, so I'm not sure. Maybe we can wrap them in components...
// or something?
export default memo(({ list, children }) => {
  const [loading, setLoading] = useState(!list.loaded());
  const [error, setError] = useState();

  useEffect(
    () => {
      if (!loading || error) {
        return;
      }

      // Trigger the loading of the fields
      list
        .initFields()
        // NOTE: We catch first to set the error, and _always_ fall through to
        // the `.then()` (by not re-throwing) so we can unset the loading flag
        .catch(fieldError => setError(fieldError))
        .then(() => setLoading(false));
    },
    [list, loading, error, setLoading, setError]
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageError>
        {process.env.NODE_ENV === 'production'
          ? 'There was an error loading the page'
          : error.message || error.toString()}
      </PageError>
    );
  }

  return children;
});
