/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, KebabHorizontalIcon } from '@primer/octicons-react';
import { FlexGroup } from '@arch-ui/layout';
import { LoadingSpinner } from '@arch-ui/loading';

import Page from './Page';

function ariaPageLabelFn(page) {
  return `Go to page ${page}`;
}

const PageChildren = ({ page, isLoading, isSelected }) => {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading && isSelected) {
      const id = setTimeout(() => {
        setShouldShowLoading(true);
      }, 200);
      return () => {
        clearTimeout(id);
        setShouldShowLoading(false);
      };
    }
  }, [page, isLoading, isSelected]);

  return shouldShowLoading ? (
    <div css={{ height: 19 }}>
      <LoadingSpinner />
    </div>
  ) : (
    <span>{page}</span>
  );
};

const Pagination = ({
  ariaPageLabel = ariaPageLabelFn,
  currentPage = 1,
  limit = 5,
  pageSize,
  total,
  isLoading,
  onChange,
  ...props
}) => {
  if (total <= pageSize) return null;

  const pages = [];
  const totalPages = Math.ceil(total / pageSize);

  let minPage = 1;
  let maxPage = totalPages;

  if (limit && limit < totalPages) {
    const rightLimit = Math.floor(limit / 2);
    const leftLimit = rightLimit + (limit % 2) - 1;
    minPage = currentPage - leftLimit;
    maxPage = currentPage + rightLimit;

    if (minPage < 1) {
      maxPage = limit;
      minPage = 1;
    }

    if (maxPage > totalPages) {
      minPage = totalPages - limit + 1;
      maxPage = totalPages;
    }
  }

  const handleChange = page => {
    if (onChange) {
      onChange(page, {
        pageSize,
        total,
        minPage,
        maxPage,
      });
    }
  };

  // go to first
  if (minPage > 1) {
    pages.push(
      <Page aria-label={ariaPageLabel(1)} key="page_start" onClick={handleChange} value={1}>
        <KebabHorizontalIcon />
      </Page>
    );
  }

  // loop over range
  for (let page = minPage; page <= maxPage; page++) {
    const isSelected = page === currentPage;
    pages.push(
      <Page
        aria-label={ariaPageLabel(page)}
        aria-current={isSelected ? 'page' : null}
        key={`page_${page}`}
        isSelected={isSelected}
        onClick={handleChange}
        value={page}
      >
        <PageChildren isLoading={isLoading} page={page} isSelected={isSelected} />
      </Page>
    );
  }

  // go to last
  if (maxPage < totalPages) {
    pages.push(
      <Page
        aria-label={ariaPageLabel(totalPages)}
        key="page_end"
        onClick={handleChange}
        value={totalPages}
      >
        <KebabHorizontalIcon />
      </Page>
    );
  }

  return (
    <FlexGroup as="nav" align="center" aria-label="Pagination" isInline {...props}>
      <Page
        aria-label="Go to previous page"
        key="page_prev"
        onClick={handleChange}
        value={currentPage - 1}
        isDisabled={currentPage === 1}
      >
        <ChevronLeftIcon />
      </Page>
      {pages}
      <Page
        aria-label="Go to next page"
        key="page_next"
        onClick={handleChange}
        value={currentPage + 1}
        isDisabled={currentPage === totalPages}
      >
        <ChevronRightIcon />
      </Page>
    </FlexGroup>
  );
};

export default Pagination;
