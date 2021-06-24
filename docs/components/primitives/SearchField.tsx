/** @jsx jsx */
import { jsx, Global, css } from '@emotion/react';
import { useEffect, Fragment, HTMLAttributes } from 'react';

import { SearchKeys } from '../icons/SearchKeys';
import { Search } from '../icons/Search';
import { Field } from './Field';

import { algoliaStyles } from '../../lib/algoliaStyles';

type SearchFieldProps = HTMLAttributes<HTMLElement>;

export function SearchField(props: SearchFieldProps) {
  useEffect(() => {
    if (window.docsearch) {
      window.docsearch({
        apiKey: '211e94c001e6b4c6744ae72fb252eaba',
        indexName: 'keystonejs',
        inputSelector: '#search-field',
        debug: true,
      });
    } else {
      console.warn('Search has failed to load');
    }
  }, []);
  return (
    <Fragment>
      <Global
        styles={css`
        ${algoliaStyles}
      `}
      />
      <span
        css={{
          position: 'relative',
          display: 'block',
          color: 'var(--muted)',
        }}
      >
        <label
          htmlFor="search-field"
          css={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: 0,
            bottom: 0,
            left: '1rem',
          }}
        >
          <Search css={{ width: '1.25rem', zIndex: 1 }} />
        </label>
        <Field
          placeholder="Search the docs"
          id="search-field"
          css={{
            padding: '0 3.5rem 0 2.8rem',
          }}
          {...props}
        />
        <label
          htmlFor="search-field"
          css={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            top: 0,
            bottom: 0,
            right: '1rem',
          }}
        >
          <SearchKeys
            css={{
              height: '1.5rem',
              border: '1px solid var(--border)',
              borderRadius: '3px',
              padding: '0.325rem',
            }}
          />
        </label>
      </span>
    </Fragment>
  );
}
