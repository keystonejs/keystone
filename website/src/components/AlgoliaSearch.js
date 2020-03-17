/** @jsx jsx */

import { jsx } from '@emotion/core';
import { forwardRef, useState, useEffect, createRef } from 'react';
import {
  InstantSearch,
  Index,
  connectStateResults,
  connectSearchBox,
  Highlight,
  // Snippet,
  Hits,
} from 'react-instantsearch-dom';
import algoliasearch from 'algoliasearch/lite';
import { Link } from 'gatsby';

// import { Root, HitsWrapper, PoweredBy } from './styles';
// import Input from './Input';
// import * as hitComps from './hitComps';

const Results = connectStateResults(({ searchState: state, searchResults: res, children }) =>
  res && res.nbHits > 0 ? children : `No results for '${state.query}'`
);

const Stats = connectStateResults(
  ({ searchResults: res }) =>
    res && res.nbHits > 0 && `${res.nbHits} result${res.nbHits > 1 ? `s` : ``}`
);

const useClickOutside = (ref, handler, events) => {
  if (!events) events = [`mousedown`, `touchstart`];
  const detectClickOutside = event => !ref.current.contains(event.target) && handler();
  useEffect(() => {
    for (const event of events) document.addEventListener(event, detectClickOutside);
    return () => {
      for (const event of events) document.removeEventListener(event, detectClickOutside);
    };
  });
};

const indices = [
  { name: `Guides`, title: `Guides` },
  { name: `API`, title: `API` },
];

export function AlgoliaSearch() {
  const ref = createRef();
  const [query, setQuery] = useState(``);
  const [focus, setFocus] = useState(false);
  const searchClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_SEARCH_KEY
  );
  useClickOutside(ref, () => setFocus(false));
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={indices[0].name}
      onSearchStateChange={({ query }) => setQuery(query)}
    >
      <Root ref={ref}>
        <Input focus={focus} onFocus={() => setFocus(true)} />
        {query && query.length > 0 && focus && (
          <HitsWrapper>
            {indices.map(({ name, title }) => (
              <Index key={name} indexName={name}>
                <header>
                  <h3 css={{}}>{title}</h3>
                  <Stats />
                </header>
                <Results>
                  <Hits hitComponent={Hit} />
                </Results>
              </Index>
            ))}
            {/* <PoweredBy /> */}
          </HitsWrapper>
        )}
      </Root>
    </InstantSearch>
  );
}

const Input = connectSearchBox(({ refine, ...rest }) => (
  <input
    type="text"
    placeholder="Search"
    aria-label="Search"
    onChange={e => refine(e.target.value)}
    {...rest}
  />
));

export const Hit = ({ hit }) => (
  <div>
    <Link to={hit.slug}>
      <h4>
        <Highlight attribute="pageTitle" hit={hit} tagName="mark" />
      </h4>
    </Link>
    {/* <Snippet attribute="excerpt" hit={hit} tagName="mark" /> */}
  </div>
);

const Root = forwardRef((props, ref) => (
  <div
    ref={ref}
    css={{
      position: 'relative',
    }}
    {...props}
  />
));

const HitsWrapper = props => (
  <div
    css={{
      position: 'absolute',
      top: 'calc(100% + 0.5em)',
      backgroundColor: 'white',
      maxHeight: '30vh',
      width: '100%',
      maxWidth: '30em',
      overflow: 'scroll',
      zIndex: 2,
      padding: '2rem',
    }}
    {...props}
  />
);
