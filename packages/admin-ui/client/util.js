import React from 'react';
import set from 'lodash.set';

// When there are errors, we want to see if they're Access Denied.
// If so, we modify the dataset (which otherwise would be `null`) to have an
// Error object, which we'll use later in the UI code.
export const deconstructErrorsToDataShape = error => {
  const data = {};

  if (error && error.graphQLErrors && error.graphQLErrors.length) {
    error.graphQLErrors
      // Comes from the backend. Specific to Keystone, so shouldn't
      // give false positives with regular GraphQL errors
      .filter(gqlError => gqlError.name && gqlError.name === 'AccessDeniedError')
      .forEach(gqlError => {
        // Set the gqlError message to the path as reported by the graphql
        // gqlError
        const gqlErrorObj = new Error(`${gqlError.message} (${gqlError.uid})`);
        gqlErrorObj.name = gqlError.name;
        set(data, gqlError.path, gqlErrorObj);
      });
  }

  return data;
};

export function toastItemSuccess(toast, item, message = 'Success') {
  const toastContent = (
    <div>
      {item && item._label_ ? <strong>{item._label_}</strong> : null}
      <div>{message}</div>
    </div>
  );

  toast.addToast(toastContent, {
    autoDismiss: true,
    appearance: 'success',
  })();
}

export function toastError(toast, error) {
  const [title, ...rest] = error.message.split(/\:/);
  const toastContent = rest.length ? (
    <div>
      <strong>{title.trim()}</strong>
      <div>{rest.join('').trim()}</div>
    </div>
  ) : (
    error.message
  );

  toast.addToast(toastContent, {
    appearance: 'error',
  })();
}
