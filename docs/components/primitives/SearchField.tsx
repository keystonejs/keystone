/** @jsx jsx */
import { jsx } from '@emotion/react';

import { SearchKeys } from '../icons/SearchKeys';
import { Search } from '../icons/Search';
import { Field } from './Field';

export function SearchField(props) {
  return (
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
        <Search css={{ width: '1.25rem' }} />
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
  );
}
