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

// ==============================
// Toast Formatters
// ==============================

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

// ==============================
// Clipboard
// ==============================

const defaultSuccessCallback = () => console.log('Copying to clipboard was successful!');
const defaultErrorCallback = err => console.error('Could not copy text:', err);

function fallbackCopyToClipboard(text, successCb, errorCb) {
  var textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var callback = successful ? successCb : errorCb;
    callback();
  } catch (err) {
    errorCb(err);
  }

  document.body.removeChild(textArea);
}
export function copyToClipboard(
  text,
  successCb = defaultSuccessCallback,
  errorCb = defaultErrorCallback
) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).then(successCb, errorCb);
    return;
  }

  // attempt fallback
  fallbackCopyToClipboard(text, successCb, errorCb);
}

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
