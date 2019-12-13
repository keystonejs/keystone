/** @jsx jsx **/
import { jsx } from '@emotion/core';
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

// ==============================
// Toast Formatters
// ==============================

export function toastItemSuccess({ addToast }, item, message = 'Success') {
  const toastContent = (
    <div>
      {item && item._label_ ? <strong>{item._label_}</strong> : null}
      <div>{message}</div>
    </div>
  );

  addToast(toastContent, {
    autoDismiss: true,
    appearance: 'success',
  });
}

export function toastError({ addToast, options = {} }, error) {
  const [title, ...rest] = error.message.split(/\:/);
  const toastContent = rest.length ? (
    <div>
      <strong>{title.trim()}</strong>
      <div>{rest.join('').trim()}</div>
    </div>
  ) : (
    error.message
  );

  addToast(toastContent, {
    appearance: 'error',
    ...options,
  });
}

export const handleCreateUpdateMutationError = ({ error, addToast }) => {
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach(error => {
      let toastContent;
      if (error.data && error.data.messages && error.data.messages.length) {
        toastContent = (
          <div>
            <strong>{error.name}</strong>
            <ul css={{ paddingLeft: 0, listStylePosition: 'inside' }}>
              {error.data.messages.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        toastContent = (
          <div>
            <strong>{error.name}</strong>
            <div>{error.message}</div>
          </div>
        );
      }
      addToast(toastContent, {
        appearance: 'error',
        autoDismiss: true,
      });
    });
  }
};

// ==============================
// Validate Fields
// ==============================

export async function validateFields(fields, item, data) {
  const errors = {};
  const warnings = {};

  await Promise.all(
    fields.map(({ validateInput, path }) => {
      const addFieldValidationError = (message, data) => {
        errors[path] = errors[path] || [];
        errors[path].push({ message, data });
      };

      const addFieldValidationWarning = (message, data) => {
        warnings[path] = warnings[path] || [];
        warnings[path].push({ message, data });
      };

      return validateInput({
        resolvedData: data,
        originalInput: item,
        addFieldValidationError,
        addFieldValidationWarning,
      });
    })
  );

  return {
    errors,
    warnings,
  };
}
