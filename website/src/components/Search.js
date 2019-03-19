/** @jsx jsx */

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { jsx } from '@emotion/core';
import Select from '@arch-ui/select';
import { Location } from '@reach/router';

import { getResults } from '../utils/search';

const buildOptions = arr => {
  let ops = [];

  arr.forEach(i => {
    if (!i.navGroup) {
      return;
    }

    const groupLabel = i.navGroup.replace('-', ' ');

    if (!ops.some(o => o.label === groupLabel)) {
      ops.push({
        label: groupLabel,
        options: [],
      });
    }

    ops.find(o => o.label === groupLabel).options.push(i);
  });

  return ops;
};
const defaultOptions = [
  {
    label: 'Recommended',
    options: [
      { title: 'Quick Start', slug: '/quick-start/', navGroup: 'recommended' },
      { title: 'Field Types', slug: '/keystone-alpha/fields/', navGroup: 'recommended' },
      { title: 'Access Control', slug: '/keystone-alpha/access-control/', navGroup: 'recommended' },
    ],
  },
];

export const Search = () => {
  let [query, setQuery] = useState('');
  let [results, setResults] = useState([]);

  const setQueryDebounced = useCallback(debounce(value => setQuery(value), 200), [setQuery]);

  useEffect(() => {
    let cancelled = false;

    if (!query) {
      return;
    }

    getResults(query, { limit: 10 }).then(queryResults => {
      if (cancelled) {
        return;
      }

      // NOTE: is this really necessary?
      // Append "Show More" link to the results
      if (queryResults.total !== 0 && queryResults.results.length !== queryResults.total) {
        queryResults.results.push({
          navGroup: 'more-results',
          slug: '/search?q=' + encodeURIComponent(query),
          title: `Show ${queryResults.total - queryResults.results.length} More`,
        });
      }

      setResults(buildOptions(queryResults.results));
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
            options={query ? results : defaultOptions}
            value={null}
            onInputChange={setQueryDebounced}
            onChange={result => {
              setQueryDebounced.cancel();
              navigate(result.slug);
              setQuery('');
            }}
            css={{ zIndex: 2 }}
            filterOption={filterOption}
            getOptionValue={result => result.slug}
            getOptionLabel={result => result.title}
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
  isDisabled,
  isHidden,
  selectProps,
  theme,
  ...props
}) => (
  <div
    css={{
      margin: 2,
      paddingBottom: 2,
      paddingTop: 2,
      visibility: isDisabled ? 'hidden' : 'visible',
    }}
  >
    <input
      ref={innerRef}
      css={{
        background: 0,
        border: 0,
        color: 'inherit',
        fontSize: 'inherit',
        opacity: isHidden ? 0 : 1,
        outline: 0,
        padding: 0,
      }}
      {...props}
    />
  </div>
);
const IndicatorSeparator = null;

// ==============================
// Utilities
// ==============================

// remove options that aren't present in the sidebar
let filterOption = ({ data }) => Boolean(data.navGroup);
