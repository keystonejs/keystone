/** @jsx jsx */
import { Link, useRouter } from '../../router';
import { useList } from '../..';
import { jsx, Center, Stack } from '@keystone-ui/core';

function Page({ page, currentPage }: { page: number; currentPage: number }) {
  const { query } = useRouter();
  const newQuery = { ...query, page: page as number | undefined };
  if (page === 1) {
    delete newQuery.page;
  }

  return (
    <Link
      css={{
        textDecoration: currentPage === page ? 'none' : undefined,
        color: currentPage === page ? 'inherit' : undefined,
      }}
      href={{ query: newQuery }}
    >
      {page}
    </Link>
  );
}

export function Pagination({
  currentPage,
  total,
  pageSize,
  listKey,
}: {
  currentPage: number;
  total: number;
  pageSize: number;
  listKey: string;
}) {
  const list = useList(listKey);

  if (total <= pageSize) return null;

  const pages = [];
  const totalPages = Math.ceil(total / pageSize);

  let minPage = 1;
  let maxPage = totalPages;
  const limit = 5;
  if (limit < totalPages) {
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

  if (minPage > 1) {
    pages.push(<Page key="page_start" currentPage={currentPage} page={1} />);
  }

  for (let page = minPage; page <= maxPage; page++) {
    pages.push(<Page key={page} page={page} currentPage={currentPage} />);
  }

  // go to last
  if (maxPage < totalPages) {
    pages.push(<Page key="page_end" page={totalPages} currentPage={currentPage} />);
  }
  return (
    <Center>
      <Stack across gap="small">
        {pages}
      </Stack>
      <PaginationLabel
        currentPage={currentPage}
        pageSize={pageSize}
        plural={list.plural}
        singular={list.singular}
        total={total}
      />
    </Center>
  );
}

export function PaginationLabel({
  currentPage,
  pageSize,
  plural,
  singular,
  total,
}: {
  currentPage: number;
  pageSize: number;
  plural: string;
  singular: string;
  total: number;
}) {
  if (!total) {
    return <span>No {plural}</span>;
  }

  let count = '';
  const start = pageSize * (currentPage - 1) + 1;
  const end = Math.min(start + pageSize - 1, total);

  if (total > pageSize) {
    count = `${start} to ${end} of ${total} ${plural}`;
  } else {
    count = `${total} `;
    if (total > 1 && plural) {
      count += plural;
    } else if (total === 1 && singular) {
      count += singular;
    }
  }

  return (
    <span>
      Showing <strong>{count}</strong>
    </span>
  );
}
