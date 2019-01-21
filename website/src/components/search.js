import { useState, useMemo } from 'react';
import { Link } from 'gatsby';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { colors } from '@arch-ui/theme';

import { getResults } from '../utils/search';

/** @jsx jsx */

const Input = styled.input({
  background: colors.B.A10,
  padding: 10,
  fontSize: '1em',
  border: 'none',
  borderRadius: 6,
  boxSizing: 'border-box',
  border: '2px solid transparent',

  '&:focus': {
    outline: 'none',
    borderColor: colors.B.base,
  },

  '&::placeholder': {
    color: colors.B.base,
  },
});

const ResultsList = styled.div({
  background: 'white',
  boxShadow: `0 3px 10px rgba(0,0,0,0.25)`,
  maxWidth: 300,
  padding: '0px 15px',
  position: 'absolute',
  right: 21,
  top: 60,
  fontSize: '1em',
});

// Search component
const Search = () => {
  let [query, setQuery] = useState('');

  let results = useMemo(() => getResults(query), [query]);

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={event => {
          setQuery(event.target.value);
        }}
        placeholder="Search"
      />
      {results.length ? (
        <ResultsList>
          <ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {results.slice(0, 12).map(result => (
              <li
                css={{
                  padding: 10,
                  borderBottom: `1px solid ${colors.B.A25}`,
                }}
                key={result.slug}
              >
                <Link
                  style={{ color: colors.B.base, textTransform: 'capitalize' }}
                  to={result.slug}
                >
                  {result.title}
                </Link>{' '}
                <small style={{ color: 'grey' }}>({result.workspace})</small>
              </li>
            ))}
          </ul>
          <Link
            to={`/search?q=${encodeURIComponent(query)}`}
            css={{ textAlign: 'center', padding: 5, display: 'block', color: colors.B.base }}
          >
            See More
          </Link>
        </ResultsList>
      ) : null}
    </div>
  );
};

export default Search;
