import React, { Fragment, memo } from 'react';
import { HiddenInput } from './HiddenInput';
// Autocomplete Captor
// ==============================

/*
 *  Why?
 *  ------------------------------
 *  For a while now browsers have been ignoring the `autocomplete="off"`
 *  property on form and input elements:
 *  - https://bugs.chromium.org/p/chromium/issues/detail?id=468153#c164
 *
 *  How?
 *  ------------------------------
 *  Browsers will autocomplete inputs in the order they're encountered; this
 *  component will capture the browser's attempt to autocomplete into these
 *  two hidden inputs and leave your legitimate fields unpolluted.
 *
 *  NOTE
 *  ------------------------------
 *  This component *must* be rendered before your legitimate fields.
 */

export const AutocompleteCaptor = memo(
  function AutocompleteCaptor() {
    return (
      <Fragment>
        <HiddenInput autoComplete="username" type="text" tabIndex={-1} />
        <HiddenInput autoComplete="email" type="text" tabIndex={-1} />
        <HiddenInput autoComplete="current-password" type="password" tabIndex={-1} />
        <HiddenInput autoComplete="new-password" type="password" tabIndex={-1} />
      </Fragment>
    );
  },
  () => true
);
