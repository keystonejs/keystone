/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useEffect, useRef } from 'react';
import { navigate } from '@reach/router';
import { Input } from '@arch-ui/input';

import { addCallback } from '../utils/async-load-search';
import { algoliaStyles } from '../utils/algolia-styles';

const searchId = 'algolia-doc-search';

let a;

if (typeof window !== 'undefined') {
  a = document.createElement('a');
}

function getHash(url) {
  a.href = url;
  return a.hash;
}

export const Search = () => {
  const inputRef = useRef();

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
            const url = suggestion.url.replace('https://keystonejs.com', '');
            navigate(url);
            const hash = window.decodeURI(getHash(url));
            if (hash !== '#' && hash !== '') {
              const element = document.querySelector(`.docSearch-content ${hash} a`);
              if (element) {
                element.click();
              }
            }
          },
        });
      } else {
        // eslint-disable-next-line no-console
        console.warn('Search has failed to load and is now disabled');
      }
    });
  }, []);

  return (
    <form css={[algoliaStyles]}>
      <Input
        ref={inputRef}
        id={searchId}
        type="search"
        placeholder="Search..."
        aria-label="Search..."
      />
    </form>
  );
};
