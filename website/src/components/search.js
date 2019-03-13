import { useState, useEffect, useCallback } from 'react';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import Select from '@arch-ui/select';
import { Location } from '@reach/router';
import { colors } from '@arch-ui/theme';
import debounce from 'lodash.debounce';

import { getResults } from '../utils/search';

const SEARCH_DEBOUNCE = 200;

let renderOptionLabel = result => {
  if (result.type === 'show-more') {
    return <div css={{ color: colors.B.base }}>&gt; Show {result.totalNotShown} More</div>;
  }
  return (
    <div>
      <span css={{ color: colors.B.base, textTransform: 'capitalize' }}>{result.title}</span>{' '}
      <small style={{ color: 'grey' }}>({result.navGroup})</small>
    </div>
  );
};

const Search = () => {
  let [input, setInput] = useState('');
  let [query, setQuery] = useState('');
  let [results, setResults] = useState([]);

  const setQueryDebounced = useCallback(debounce(value => setQuery(value), SEARCH_DEBOUNCE), [
    setQuery,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (!query) {
      return;
    }

    getResults(query, { limit: 10 }).then(queryResults => {
      if (cancelled) {
        return;
      }

      if (queryResults.total !== 0 && queryResults.results.length !== queryResults.total) {
        queryResults.results.push({
          slug: '/search?q=' + encodeURIComponent(query),
          type: 'show-more',
          totalNotShown: queryResults.total - queryResults.results.length,
        });
      }

      setResults(queryResults.results);
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <Location>
      {({ navigate }) => {
        return (
          <Select
            placeholder="Search..."
            options={results}
            value={null}
            inputValue={input}
            onInputChange={value => {
              setInput(value);
              setQueryDebounced(value);
            }}
            onChange={result => {
              setQueryDebounced.cancel();
              navigate(result.slug);
              setQuery('');
            }}
            css={{ width: 256 }}
            filterOption={() => true}
            formatOptionLabel={renderOptionLabel}
            getOptionValue={result => result.slug}
            noOptionsMessage={() => (query ? 'No results found' : 'Enter a search term')}
          />
        );
      }}
    </Location>
  );
};

export default Search;
