import { useState, useMemo } from 'react';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import Select from '@arch-ui/select';
import { Location } from '@reach/router';
import { colors } from '@arch-ui/theme';

import { getResults } from '../utils/search';

let renderOptionLabel = result => {
  if (result.type === 'show-more') {
    return <div css={{ color: colors.B.base }}>Show More</div>;
  }
  return (
    <div>
      <span css={{ color: colors.B.base, textTransform: 'capitalize' }}>{result.title}</span>{' '}
      <small style={{ color: 'grey' }}>({result.workspace})</small>
    </div>
  );
};

const Search = () => {
  let [query, setQuery] = useState('');

  let results = useMemo(
    () => {
      let _results = getResults(query);
      if (_results.length !== 0) {
        _results.push({
          slug: '/search?q=' + encodeURIComponent(query),
          type: 'show-more',
        });
      }
      return _results;
    },
    [query]
  );

  return (
    <Location>
      {({ navigate }) => {
        return (
          <Select
            placeholder="Search..."
            options={results}
            value={null}
            inputValue={query}
            onInputChange={value => {
              setQuery(value);
            }}
            onChange={result => {
              navigate(result.slug);
              setQuery('');
            }}
            css={{ width: 256 }}
            filterOption={() => true}
            formatOptionLabel={renderOptionLabel}
            getOptionValue={result => result.slug}
          />
        );
      }}
    </Location>
  );
};

export default Search;
