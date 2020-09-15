/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Button } from '@arch-ui/button';
import { InfoIcon } from '@primer/octicons-react';
import { colors } from '@arch-ui/theme';

import { useListPagination } from '../pages/List/dataHooks';

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
    <InfoIcon size={48} css={{ marginBottom: '0.5em' }} />
    {children}
  </div>
);

export const NoResults = ({ currentPage, filters, list, search }) => {
  const { onChange } = useListPagination();
  const onResetPage = () => onChange(1);

  const pageDepthMessage = (
    <NoResultsWrapper>
      <p>{`Not enough ${list.plural.toLowerCase()} found to show page ${currentPage}.`}</p>
      <Button variant="ghost" onClick={onResetPage}>
        Show first page
      </Button>
    </NoResultsWrapper>
  );

  if (currentPage !== 1) {
    return pageDepthMessage;
  }

  if (filters && filters.length) {
    return (
      <NoResultsWrapper>
        {`No ${list.plural.toLowerCase()} found matching the ${
          filters.length > 1 ? 'filters' : 'filter'
        }`}
      </NoResultsWrapper>
    );
  }

  if (search && search.length) {
    return (
      <NoResultsWrapper>
        {`No ${list.plural.toLowerCase()} found matching “${search}”`}
      </NoResultsWrapper>
    );
  }

  return <NoResultsWrapper>{`No ${list.plural.toLowerCase()} to display yet...`}</NoResultsWrapper>;
};
