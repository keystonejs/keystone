/** @jsx jsx **/
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import set from 'lodash.set';

// When there are errors, we want to see if they're Access Denied.
// If so, we modify the dataset (which otherwise would be `null`) to have an
// Error object, which we'll use later in the UI code.
export const deconstructErrorsToDataShape = ({ graphQLErrors = [] } = {}) => {
  const data = {};

  graphQLErrors.forEach(({ name, path, message, uid }) => {
    // Comes from the backend. Specific to Keystone, so shouldn't
    // give false positives with regular GraphQL errors
    if (name === 'AccessDeniedError') {
      const gqlErrorObj = new Error(`${message} (${uid})`);
      gqlErrorObj.name = name;

      // Set the gqlError message to the path as reported by the error
      set(data, path, gqlErrorObj);
    }
  });

  return data;
};

// ==============================
// Toast Formatters
// ==============================

export function toastItemSuccess(
  { addToast, customToast },
  { item, list },
  message = 'Success',
  toastAction
) {
  const toastContent = customToast ? (
    customToast({ item, toastAction, list, message })
  ) : (
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

/**
 * Key Down Hook
 * ------------------------------
 * @param {string} targetKey - The key to target e.g. 'Alt', or 'Shift'
 * @param {tuple} [keydownHandler, keyupHandler] - Optional event handlers
 * @returns {boolean} keyIsDown - whether or not the target key is down
 */

export function useKeyDown(targetKey, [keydownHandler, keyupHandler] = []) {
  const [keyIsDown, setKeyDown] = useState(false);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key !== targetKey) return;
      e.preventDefault();
      if (keydownHandler) keydownHandler(e);

      setKeyDown(true);
    };

    const handleKeyUp = e => {
      if (e.key !== targetKey) return;
      e.preventDefault();
      if (keyupHandler) keyupHandler(e);

      setKeyDown(false);
    };

    document.addEventListener('keydown', handleKeyDown, { isPassive: true });
    document.addEventListener('keyup', handleKeyUp, { isPassive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { isPassive: true });
      document.removeEventListener('keyup', handleKeyUp, { isPassive: true });
    };
  }, [keydownHandler, keyupHandler]);

  return keyIsDown;
}

/**
 * Selection Hook
 * ------------------------------
 * @param {string} listKey - The key for the list to operate on.
 * @returns {[Object, Function]}
 * - fields - an array of the current columns
 * - onChange - the change handler for columns
 */

// NOTE: disable text selection
// ensures the browser receives the click event on our checkbox
const bodyUserSelect = val => {
  ['WebkitUserSelect', 'MozUserSelect', 'msUserSelect', 'userSelect'].forEach(k => {
    document.body.style[k] = val;
  });
};

export function useListSelect(items) {
  const [lastChecked, setLastChecked] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleKeyDown = () => {
    if (selectedItems.length > 0) bodyUserSelect('none');
  };
  const handleKeyUp = () => {
    if (selectedItems.length > 0) bodyUserSelect(null);
  };
  const shiftIsDown = useKeyDown('Shift', [handleKeyDown, handleKeyUp]);

  const onSelect = value => {
    let nextSelected = selectedItems.slice(0);

    if (Array.isArray(value)) {
      setSelectedItems(value);
    } else if (shiftIsDown && lastChecked) {
      const itemIds = items.map(i => i.id);
      const from = itemIds.indexOf(value);
      const to = itemIds.indexOf(lastChecked);
      const start = Math.min(from, to);
      const end = Math.max(from, to) + 1;

      itemIds
        .slice(start, end)
        .filter(id => id !== lastChecked)
        .forEach(id => {
          if (!nextSelected.includes(lastChecked)) {
            nextSelected = nextSelected.filter(existingId => existingId !== id);
          } else {
            nextSelected.push(id);
          }
        });

      const uniqueItems = [...new Set(nextSelected)]; // lazy ensure unique

      setLastChecked(value);
      setSelectedItems(uniqueItems);
    } else {
      if (nextSelected.includes(value)) {
        nextSelected = nextSelected.filter(existingId => existingId !== value);
      } else {
        nextSelected.push(value);
      }

      setLastChecked(value);
      setSelectedItems(nextSelected);
    }
  };

  return [selectedItems, onSelect];
}
