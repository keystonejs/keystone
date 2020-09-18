/* @jsx jsx */

import { jsx, useTheme } from '@keystone-ui/core';
import Link from 'next/link';
import { DocumentNode, useQuery } from '../apollo';

import { useKeystone, useList } from '../KeystoneContext';
import { PageContainer } from '../components/PageContainer';
import { Navigation } from '../components/Navigation';

type ListCardProps = {
  listKey: string;
  count:
    | {
        type: 'success';
        count: number;
      }
    | { type: 'no-access' }
    | { type: 'error'; message: string };
};

const ListCard = ({ listKey, count }: ListCardProps) => {
  const { palette, spacing, radii } = useTheme();
  const list = useList(listKey);
  return (
    <div>
      <h3
        css={{
          margin: spacing.medium,
          display: 'inline-block',
        }}
      >
        <Link href={list.path} passHref>
          <a
            css={{
              borderWidth: 1,
              borderColor: palette.neutral200,
              borderRadius: radii.medium,
              textDecoration: 'none',
              display: 'inline-block',
              color: palette.blue700,
              padding: spacing.large,
              ':hover': {
                borderColor: palette.blue300,
                textDecoration: 'underline',
              },
            }}
          >
            {list.label}{' '}
            {count.type === 'success'
              ? count.count
              : count.type === 'error'
              ? count.message
              : 'No access'}
          </a>
        </Link>
      </h3>
    </div>
  );
};

export const HomePage = ({ query }: { query: DocumentNode }) => {
  const {
    adminMeta: { lists },
  } = useKeystone();

  let { data, error } = useQuery(query, { errorPolicy: 'all' });
  if (error?.networkError) {
    return error.message;
  }

  if (!data) {
    return 'Loading...';
  }

  return (
    <PageContainer>
      <Navigation />
      <h2>Lists</h2>
      {Object.keys(lists).map(key => {
        let err = error?.graphQLErrors.find(err => err.path?.[0] === key);
        // TODO: Checking based on the message is bad, but we need to revisit GraphQL errors in
        // Keystone to fix it and that's a whole other can of worms...
        if (err?.message === 'You do not have access to this resource') {
          console.log(err);
          return <ListCard count={{ type: 'no-access' }} key={key} listKey={key} />;
        }
        return (
          <ListCard
            count={
              err?.message
                ? { type: 'error', message: err.message }
                : { type: 'success', count: data[key].count }
            }
            key={key}
            listKey={key}
          />
        );
      })}
    </PageContainer>
  );
};
