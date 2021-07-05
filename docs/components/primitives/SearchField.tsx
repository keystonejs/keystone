/** @jsx jsx */
import { jsx, Global, css } from '@emotion/react';
import { Fragment, HTMLAttributes } from 'react';

import { algoliaStyles } from '../../lib/algoliaStyles';
import { SearchKeys } from '../icons/SearchKeys';
import { Search } from '../icons/Search';
import { Field } from './Field';

type SearchFieldProps = HTMLAttributes<HTMLElement>;

export function SearchField(props: SearchFieldProps) {
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
          aria-label="Search the docs"
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
