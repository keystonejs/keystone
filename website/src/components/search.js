/** @jsx jsx */

import { useState, useEffect, useCallback } from 'react';
import { jsx } from '@emotion/core';
import Select from '@arch-ui/select';
import { Location } from '@reach/router';
import { colors } from '@arch-ui/theme';
import debounce from 'lodash.debounce';

import { getResults } from '../utils/search';

export const Search = () => {
  let [input, setInput] = useState('');
  let [query, setQuery] = useState('');
  let [results, setResults] = useState([]);

  const setQueryDebounced = useCallback(debounce(value => setQuery(value), 200), [setQuery]);

  useEffect(() => {
    let cancelled = false;

    if (!query) {
      return;
    }

    getResults(query, { limit: 10 }).then(queryResults => {
      console.log('getResults');
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
            key="select"
            components={{ Control, DropdownIndicator, IndicatorSeparator, Input }}
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
            css={{ zIndex: 2 }}
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

// ==============================
// Styled Components
// ==============================

const DropdownIndicator = ({ innerProps, isFocused }) => (
  <div css={{ padding: '4px 6px', opacity: isFocused ? 0.8 : 0.6 }} {...innerProps}>
    <svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation">
      <path
        d="M14.823 15.883a5.5 5.5 0 1 1 1.06-1.06l2.647 2.647c.293.293.53.59 0 1.06-.53.47-.767.293-1.06 0l-2.647-2.647zM11.5 15.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        fill="currentColor"
      />
    </svg>
  </div>
);
const Control = ({ children, innerProps, innerRef, isFocused }) => {
  const backgroundColor = isFocused ? 'rgba(9, 30, 66, 0.1)' : 'rgba(9, 30, 66, 0.05)';
  return (
    <div
      ref={innerRef}
      css={{
        backgroundColor,
        boxSizing: 'border-box',
        borderRadius: 4,
        display: 'flex',
        paddingLeft: 2,
        paddingRight: 2,
      }}
      {...innerProps}
    >
      {children}
    </div>
  );
};
const Input = ({
  className,
  cx,
  getStyles,
  innerRef,
  isHidden,
  isDisabled,
  theme,
  selectProps,
  ...props
}) => (
  <div
    css={{
      paddingLeft: 2,
      paddingRight: 2,
    }}
  >
    <input
      ref={innerRef}
      css={{
        background: 0,
        border: 0,
        color: 'inherit',
        display: 'block',
        fontSize: 'inherit',
        margin: 0,
        outline: 0,
        padding: 0,
        width: '100%',
      }}
      {...props}
    />
  </div>
);
const IndicatorSeparator = null;

// ==============================
// Utilities
// ==============================

let renderOptionLabel = result => {
  if (result.type === 'show-more') {
    return <div css={{ color: colors.B.base }}>&gt; Show {result.totalNotShown} More</div>;
  }
  return (
    <div>
      <div css={{ textTransform: 'capitalize' }}>{result.title}</div>
      <small style={{ color: 'grey' }}>{result.navGroup}</small>
    </div>
  );
};
