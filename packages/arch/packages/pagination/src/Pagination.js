/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ListOrderedIcon } from '@arch-ui/icons';
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
  const [allPagesVisible, setAllPagesVisible] = useState(false);

  const toggleAllPages = () => {
    setAllPagesVisible(wereAllPagesVisible => !wereAllPagesVisible);
  };

  const renderPages = () => {
    if (total <= pageSize) return [];

    let pages = [];
    let totalPages = Math.ceil(total / pageSize);
    let minPage = 1;
    let maxPage = totalPages;
    const moreCharacter = <span>&hellip;</span>;

    if (limit && limit < totalPages) {
      let rightLimit = Math.floor(limit / 2);
      let leftLimit = rightLimit + (limit % 2) - 1;
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
        setAllPagesVisible(false);
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
          {moreCharacter}
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
          {moreCharacter}
        </Page>
      );
    }

    // return pages;
    return [
      <Page
        aria-label="Go to previous page"
        key="page_prev"
        onClick={handleChange}
        value={currentPage - 1}
        isDisabled={currentPage === 1}
      >
        <ChevronLeftIcon />
      </Page>,
      allPagesVisible ? (
        pages
      ) : (
        <Page
          aria-label="Click to show all pages"
          key="page_dot"
          onClick={toggleAllPages}
          id="ks-pagination-show-pages"
          value={1} // needs value for flow...
        >
          <ListOrderedIcon />
        </Page>
      ),
      <Page
        aria-label="Go to next page"
        key="page_next"
        onClick={handleChange}
        value={currentPage + 1}
        isDisabled={currentPage === totalPages}
      >
        <ChevronRightIcon />
      </Page>,
    ];
  };

  return (
    <FlexGroup as="nav" align="center" aria-label="Pagination" isContiguous isInline {...props}>
      {renderPages()}
    </FlexGroup>
  );
};

export default Pagination;
