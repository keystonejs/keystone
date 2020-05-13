/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Pagination } from '@arch-ui/pagination';
import { useListPagination } from './dataHooks';

const CYPRESS_TEST_ID = 'ks-pagination';

export default function ListPagination({ isLoading }) {
  const { data, onChange } = useListPagination();

  return (
    <Pagination
      currentPage={data.currentPage}
      id={CYPRESS_TEST_ID}
      onChange={onChange}
      isLoading={isLoading}
      pageSize={data.pageSize}
      total={data.itemCount}
    />
  );
}

// Count Stuff

function getRange({ currentPage, pageSize, total }) {
  const start = pageSize * (currentPage - 1) + 1;
  const end = Math.min(start + pageSize - 1, total);

  return { start, end };
}

export function getPaginationLabel({
  currentPage,
  pageSize,
  plural = 'Items',
  singular = 'Item',
  total,
}) {
  if (!total) {
    return `No ${plural}`;
  }

  let count = '';
  let { end, start } = getRange({ currentPage, pageSize, total });

  if (total > pageSize) {
    count = `Showing ${start} to ${end} of ${total}`;
  } else {
    count = `Showing ${total} `;
    if (total > 1 && plural) {
      count += plural;
    } else if (total === 1 && singular) {
      count += singular;
    }
  }

  return count;
}
