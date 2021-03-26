/** @jsx jsx */
import { useEffect, useState } from 'react';
import { jsx, Stack, useTheme } from '@keystone-ui/core';
import { Select } from '@keystone-ui/fields';
import { ChevronRightIcon, ChevronLeftIcon } from '@keystone-ui/icons';
import { Link, useRouter } from '../../router';

interface PaginationProps {
  pageSize: number;
  total: number;
  currentPage: number;
  list: Record<string, any>;
}

const usePaginationStats = ({ list, pageSize, currentPage, total }: PaginationProps) => {
  const [stats, setStats] = useState<string>('');
  useEffect(() => {
    if (total > pageSize) {
      const start = pageSize * (currentPage - 1) + 1;
      const end = Math.min(start + pageSize - 1, total);
      setStats(`${start} - ${end} of ${total} ${list.plural}`);
    } else {
      if (total > 1 && list.plural) {
        setStats(`${total} ${list.plural}`);
      } else {
        setStats(`${total} ${list.singular}`);
      }
    }
  }, [list, total, pageSize, currentPage]);

  return { stats };
};

export function Pagination({ currentPage, total, pageSize, list }: PaginationProps) {
  const { query, pathname, push } = useRouter();
  const { stats } = usePaginationStats({ list, currentPage, total, pageSize });
  const { opacity } = useTheme();

  const nextPage = currentPage + 1;
  const prevPage = currentPage - 1;
  const minPage = 1;

  const nxtQuery = { ...query, page: nextPage };
  const prevQuery = { ...query, page: prevPage };

  const limit = Math.ceil(total / pageSize);
  const pages = [];

  // Don't render the pagiantion component if the pageSize is greater than the total number of items in the list.
  if (total <= pageSize) return null;

  const onChange = (selectedOption: { value: string; label: string }) => {
    push({
      pathname,
      query: {
        ...query,
        page: selectedOption.value,
      },
    });
  };

  for (let page = minPage; page <= limit; page++) {
    pages.push({
      label: String(page),
      value: String(page),
    });
  }

  return (
    <Stack
      as="nav"
      role="navigation"
      aria-label="Pagination"
      paddingLeft="medium"
      paddingRight="medium"
      paddingTop="large"
      paddingBottom="large"
      across
      align="center"
      css={{
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      <Stack across gap="xxlarge" align="center">
        <span>{`${list.plural} per page: ${pageSize}`}</span>
        <span>
          <strong>{stats}</strong>
        </span>
      </Stack>

      <Stack gap="medium" across align="center">
        <Select
          width="medium"
          value={{ label: String(currentPage), value: String(currentPage) }}
          options={pages}
          onChange={onChange}
        />
        <span>of {limit}</span>
        <Link
          aria-label="Previous page"
          css={{
            color: '#415269',
            ...(prevPage < minPage && {
              pointerEvents: 'none',
              opacity: opacity.disabled,
            }),
          }}
          href={{ query: prevQuery }}
        >
          <ChevronLeftIcon />
        </Link>
        <Link
          aria-label="Next page"
          css={{
            color: '#415269',
            ...(nextPage > limit && {
              pointerEvents: 'none',
              opacity: opacity.disabled,
            }),
          }}
          href={{ query: nxtQuery }}
        >
          <ChevronRightIcon />
        </Link>
      </Stack>
    </Stack>
  );
}
