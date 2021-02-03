/* @jsx jsx */

import { ButtonHTMLAttributes, useState } from 'react';

import { Center, Inline, Heading, VisuallyHidden, jsx, useTheme } from '@keystone-ui/core';
import { makeDataGetter } from '@keystone-next/admin-ui-utils';
import { PlusIcon } from '@keystone-ui/icons/icons/PlusIcon';
import { DrawerController } from '@keystone-ui/modals';
import { LoadingDots } from '@keystone-ui/loading';

import { CreateItemDrawer } from '../../components/CreateItemDrawer';
import { PageContainer, HEADER_HEIGHT } from '../../components/PageContainer';
import { DocumentNode, useQuery } from '../../apollo';
import { useKeystone, useList } from '../../context';
import { useRouter, Link } from '../../router';

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
  const { colors, palette, radii, spacing } = useTheme();
  const list = useList(listKey);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  return (
    <div css={{ position: 'relative' }}>
      <Link
        href={list.path}
        css={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderRadius: radii.medium,
          borderWidth: 1,
          // boxShadow: shadow.s100,
          display: 'inline-block',
          minWidth: 280,
          padding: spacing.large,
          textDecoration: 'none',

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
          <LoadingDots label={`Loading count of ${list.plural}`} size="small" tone="passive" />
        ) : (
          'No access'
        )}
      </Link>
      <CreateButton
        disabled={isCreateModalOpen}
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
        alignItems: 'center',
        backgroundColor: theme.palette.neutral400,
        border: 0,
        borderRadius: theme.radii.xsmall,
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        height: 32,
        justifyContent: 'center',
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
    <PageContainer header={<Heading type="h3">Dashboard</Heading>}>
      {visibleLists.state === 'loading' ? (
        <Center css={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
          <LoadingDots label="Loading lists" size="large" tone="passive" />
        </Center>
      ) : (
        <Inline gap="large" paddingY="xlarge">
          {(() => {
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
      )}
    </PageContainer>
  );
};
