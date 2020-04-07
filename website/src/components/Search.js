/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useEffect, useRef } from 'react';
import { navigate } from 'gatsby';
import { Input } from '@arch-ui/input';
import { borderRadius, colors } from '@arch-ui/theme';

import { addCallback } from '../utils/async-load-search';

const searchId = 'algolia-doc-search';

function allowKeyboardRequest(event) {
  if (event.key !== '/') {
    return false;
  }
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.nodeName)) {
    return false;
  }

  return true;
}

export const Search = () => {
  const inputRef = useRef();

  // focus the input on "/" press
  useEffect(() => {
    let keyboardHandler = event => {
      if (allowKeyboardRequest(event)) {
        inputRef.current.focus();
        // prevent the "/" character from making it into the input
        event.preventDefault();
      }
    };
    window.addEventListener('keydown', keyboardHandler);
    return () => {
      window.removeEventListener('keydown', keyboardHandler);
    };
  }, []);

  // algolia docsearch callback
  useEffect(() => {
    addCallback(loaded => {
      if (loaded) {
        window.docsearch({
          apiKey: '211e94c001e6b4c6744ae72fb252eaba',
          indexName: 'keystonejs',
          inputSelector: `#${searchId}`,
          handleSelected: (input, e, suggestion) => {
            e.preventDefault();
            input.setVal('');
            input.close();
            inputRef.current.blur();
            const url = suggestion.url.replace(/https*:\/\/[www.]*keystonejs\.com/, '');
            navigate(url);
          },
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn('Search has failed to load and is now disabled');
      }
    });
  }, []);

  // NOTE: might be nice to have an actual form that submits to a
  // dedicated search page.
  return (
    <Wrapper>
      <HiddenLabel htmlFor={searchId}>Search the docs (press "/" to focus)</HiddenLabel>
      <Input
        ref={inputRef}
        id={searchId}
        type="search"
        placeholder='Search the docs (press "/" to focus)'
        css={{
          paddingLeft: 36,
          height: 40,
        }}
      />
      <SearchIcon />
    </Wrapper>
  );
};

// Styled Components
// ------------------------------

const Wrapper = props => (
  <div
    css={{
      position: 'relative',

      '.algolia-autocomplete': {
        width: '100%',
      },
      '.ds-dropdown-menu': {
        boxShadow: `rgba(9, 30, 66, 0.31) 0px 0px 1px, rgba(9, 30, 66, 0.25) 0px 4px 8px -2px`,
        borderRadius: borderRadius,
        maxWidth: '100%',
        width: '100%',

        // hide the arrow
        '::before': {
          display: 'none',
        },

        // remove border and adjust radius on inner dialog wrapper
        '[class^=ds-dataset-]': {
          border: 0,
          borderRadius: borderRadius,
        },

        // remove border marks under headings (it's covered by the result item)
        '.algolia-docsearch-suggestion--category-header .algolia-docsearch-suggestion--highlight': {
          boxShadow: 'none',
        },
      },
    }}
    {...props}
  />
);

// label for screen-readers
const HiddenLabel = props => (
  <label
    css={{
      border: 0,
      clip: 'rect(0, 0, 0, 0)',
      height: 1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      whiteSpace: 'nowrap',
      width: 1,
    }}
    {...props}
  />
);

const SearchIcon = () => (
  <svg
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    css={{
      color: colors.N40,
      height: 40,
      left: 0,
      marginLeft: 12,
      pointerEvents: 'none',
      position: 'absolute',
      top: 0,
      width: 16,
    }}
  >
    <path d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
  </svg>
);
