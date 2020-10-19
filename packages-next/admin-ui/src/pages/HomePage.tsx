/* @jsx jsx */

import { jsx, useTheme, Inline, VisuallyHidden, Center } from '@keystone-ui/core';
import { DocumentNode, useQuery } from '../apollo';

import { useKeystone, useList } from '../context';
import { PageContainer } from '../components/PageContainer';
import { makeDataGetter } from '../utils/dataGetter';
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon';
import { ButtonHTMLAttributes, useState } from 'react';
import { DrawerController } from '@keystone-ui/modals';
import { CreateItemDrawer } from '../components/CreateItemDrawer';
import { useRouter, Link } from '../router';
import { LoadingDots } from '@keystone-ui/loading';

type ListCardProps = {
  listKey: string;
  count:
    | {
        type: 'success';
        count: number;
      }
    | { type: 'no-access' }
    | { type: 'error'; message: string }
    | { type: 'loading' };
};

const ListCard = ({ listKey, count }: ListCardProps) => {
  const { colors, palette, shadow, spacing, radii } = useTheme();
  const list = useList(listKey);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  return (
    <div css={{ position: 'relative' }}>
      <Link
        href={list.path}
        css={{
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: palette.neutral200,
          borderRadius: radii.medium,
          boxShadow: shadow.s100,
          textDecoration: 'none',
          display: 'inline-block',
          padding: spacing.large,
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
        ) : count.type === 'loading' ? (
          <LoadingDots label={`Loading count of ${list.plural}`} size="small" />
        ) : (
          'No access'
        )}
      </Link>
      <CreateButton
        onClick={() => {
          setIsCreateModalOpen(true);
        }}
      >
        <PlusIcon size="large" />
        <VisuallyHidden>Create {list.singular}</VisuallyHidden>
      </CreateButton>
      <DrawerController isOpen={isCreateModalOpen}>
        <CreateItemDrawer
          listKey={list.key}
          onCreate={({ id }) => {
            router.push(`/${list.path}/${id}`);
          }}
          onClose={() => {
            setIsCreateModalOpen(false);
          }}
        />
      </DrawerController>
    </div>
  );
};

const CreateButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const theme = useTheme();
  return (
    <button
      css={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '2px',
        border: 0,
        color: 'white',
        cursor: 'pointer',
        height: 32,
        outline: 0,
        position: 'absolute',
        right: theme.spacing.large,
        top: theme.spacing.large,
        transition: 'background-color 80ms linear',
        width: 32,

        '&:hover, &:focus': {
          backgroundColor: theme.tones.positive.fill[0],
        },
      }}
      {...props}
    />
  );
};

export const HomePage = ({ query }: { query: DocumentNode }) => {
  const {
    adminMeta: { lists },
    visibleLists,
  } = useKeystone();

  let { data, error } = useQuery(query, { errorPolicy: 'all' });

  const dataGetter = makeDataGetter(data, error?.graphQLErrors);

  return (
    <PageContainer>
      <h1>Dashboard</h1>
      <Inline gap="large">
        {(() => {
          if (visibleLists.state === 'loading') {
            return (
              <Center>
                <LoadingDots label="Loading lists" />
              </Center>
            );
          }
          if (visibleLists.state === 'error') {
            return (
              <span css={{ color: 'red' }}>
                {visibleLists.error instanceof Error
                  ? visibleLists.error.message
                  : visibleLists.error[0].message}
              </span>
            );
          }
          return Object.keys(lists).map(key => {
            if (!visibleLists.lists.has(key)) {
              return null;
            }
            const result = dataGetter.get(key);
            // TODO: Checking based on the message is bad, but we need to revisit GraphQL errors in
            // Keystone to fix it and that's a whole other can of worms...
            if (result.errors?.[0].message === 'You do not have access to this resource') {
              return <ListCard count={{ type: 'no-access' }} key={key} listKey={key} />;
            }
            return (
              <ListCard
                count={
                  data
                    ? result.errors
                      ? { type: 'error', message: result.errors[0].message }
                      : { type: 'success', count: data[key].count }
                    : { type: 'loading' }
                }
                key={key}
                listKey={key}
              />
            );
          });
        })()}
      </Inline>
    </PageContainer>
  );
};
