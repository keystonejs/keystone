import { useState, useMemo } from 'react';
/** @jsx jsx */
import { jsx } from '@emotion/core';
import Select from '@arch-ui/select';
import { Location } from '@reach/router';
import { colors } from '@arch-ui/theme';

import { getResults } from '../utils/search';

let renderOptionLabel = result => {
  return (
    <div>
      <span css={{ color: colors.B.base, textTransform: 'capitalize' }}>{result.title}</span>{' '}
      <small style={{ color: 'grey' }}>({result.workspace})</small>
    </div>
  );
};

const Search = () => {
  let [query, setQuery] = useState('');

  let results = useMemo(() => getResults(query), [query]);

  return (
    <div>
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
    </div>
  );
};

export default Search;
