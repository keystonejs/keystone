/* @jsx jsx */

import { jsx, useTheme, Inline } from '@keystone-ui/core';
import Link from 'next/link';
import { DocumentNode, useQuery } from '../apollo';

import { useKeystone, useList } from '../context';
import { PageContainer } from '../components/PageContainer';
import { makeDataGetter } from '../utils/dataGetter';

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
  const { colors, palette, shadow, spacing, radii } = useTheme();
  const list = useList(listKey);
  return (
    <Link href={list.path} passHref>
      <a
        css={{
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: palette.neutral200,
          borderRadius: radii.medium,
          boxShadow: shadow.s100,
          textDecoration: 'none',
          display: 'inline-block',
          padding: spacing.large,
          marginRight: spacing.large,
          minWidth: 280,
          ':hover': {
            borderColor: palette.blue400,
          },
          ':hover h3': {
            textDecoration: 'underline',
          },
        }}
      >
        <h3 css={{ margin: `0 0 ${spacing.small}px 0` }}>{list.label} </h3>
        {count.type === 'success' ? (
          <span css={{ color: colors.foreground, textDecoration: 'none' }}>
            {count.count} item{count.count !== 1 ? 's' : ''}
          </span>
        ) : count.type === 'error' ? (
          count.message
        ) : (
          'No access'
        )}
      </a>
    </Link>
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

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);

  return (
    <PageContainer>
      <h1>Dashboard</h1>
      <Inline>
        {Object.keys(lists).map(key => {
          const result = dataGetter.get(key);
          // TODO: Checking based on the message is bad, but we need to revisit GraphQL errors in
          // Keystone to fix it and that's a whole other can of worms...
          if (result.errors?.[0].message === 'You do not have access to this resource') {
            return <ListCard count={{ type: 'no-access' }} key={key} listKey={key} />;
          }
          return (
            <ListCard
              count={
                result.errors
                  ? { type: 'error', message: result.errors[0].message }
                  : { type: 'success', count: data[key].count }
              }
              key={key}
              listKey={key}
            />
          );
        })}
      </Inline>
    </PageContainer>
  );
};
