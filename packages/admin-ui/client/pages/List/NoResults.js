/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Button } from '@arch-ui/button';
import { InfoIcon } from '@arch-ui/icons';
import { colors } from '@arch-ui/theme';

import { useListPagination } from './dataHooks';

const NoResultsWrapper = ({ children, ...props }) => (
  <div
    css={{
      alignItems: 'center',
      color: colors.N30,
      display: 'flex',
      flexDirection: 'column',
      fontSize: 32,
      justifyContent: 'center',
      padding: '1em',
      textAlign: 'center',
    }}
    {...props}
  >
    <InfoIcon css={{ height: 48, width: 48, marginBottom: '0.5em' }} />
    {children}
  </div>
);

export const NoResults = ({ currentPage, filters, itemCount, list, search }) => {
  const { onReset } = useListPagination(list.key);

  if (filters && filters.length) {
    return (
      <NoResultsWrapper>
        No {list.plural.toLowerCase()} found matching the{' '}
        {filters.length > 1 ? 'filters' : 'filter'}
      </NoResultsWrapper>
    );
  }
  if (search && search.length) {
    return (
      <NoResultsWrapper>
        No {list.plural.toLowerCase()} found matching &ldquo;
        {search}
        &rdquo;
      </NoResultsWrapper>
    );
  }

  if (currentPage !== 1) {
    return (
      <NoResultsWrapper>
        <p>
          Not enough {list.plural.toLowerCase()} found to show page {currentPage}.
        </p>
        <Button variant="ghost" onClick={onReset}>
          Show first page
        </Button>
      </NoResultsWrapper>
    );
  }

  if (itemCount === 0) {
    return <NoResultsWrapper>No {list.plural.toLowerCase()} to display yet...</NoResultsWrapper>;
  }

  return null;
};
