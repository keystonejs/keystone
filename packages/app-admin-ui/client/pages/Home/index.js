import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';

import { Container, Grid, Cell } from '@arch-ui/layout';
import { PageTitle } from '@arch-ui/typography';

import { ListProvider } from '../../providers/List';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { Box, HeaderInset } from './components';
import ContainerQuery from '../../components/ContainerQuery';
import { gqlCountQueries } from '../../classes/List';

import { useAdminMeta } from '../../providers/AdminMeta';

const HomePage = ({ lists, data, adminPath }) => (
  <main>
    <Container>
      <HeaderInset>
        <PageTitle>Dashboard</PageTitle>
      </HeaderInset>
      <ContainerQuery>
        {({ width }) => {
          let cellWidth = 3;
          if (width < 1024) cellWidth = 4;
          if (width < 768) cellWidth = 6;
          if (width < 480) cellWidth = 12;
          return (
            <Grid gap={16}>
              {lists.map(list => {
                const { key, path } = list;
                const meta = data && data[list.gqlNames.listQueryMetaName];
                return (
                  <ListProvider list={list} key={key}>
                    <Cell width={cellWidth}>
                      <Box to={`${adminPath}/${path}`} meta={meta} />
                    </Cell>
                  </ListProvider>
                );
              })}
            </Grid>
          );
        }}
      </ContainerQuery>
    </Container>
  </main>
);

const HomepageListProvider = () => {
  const { getListByKey, listKeys, adminPath } = useAdminMeta();

  // TODO: A permission query to limit which lists are visible
  const lists = listKeys.map(key => getListByKey(key));

  const query = gqlCountQueries(lists);
  const { data, error } = useQuery(query, { fetchPolicy: 'cache-and-network', errorPolicy: 'all' });

  if (lists.length === 0) {
    return (
      <Fragment>
        <DocTitle title="Home" />
        <PageError>
          <p>
            No lists defined.{' '}
            <Link href="https://keystonejs.com/guides/add-lists">
              Get started by creating your first list.
            </Link>
          </p>
        </PageError>
      </Fragment>
    );
  }

  let allowedLists = lists;

  if (error) {
    if (!error.graphQLErrors || !error.graphQLErrors.length) {
      return (
        <PageError>
          <p>{error.message}</p>
        </PageError>
      );
    }

    const deniedQueries = error.graphQLErrors
      .filter(({ name }) => name === 'AccessDeniedError')
      .map(({ path }) => path && path[0]);

    if (deniedQueries.length !== error.graphQLErrors.length) {
      // There were more than Access Denied Errors, so throw a normal
      // error message
      return (
        <PageError>
          <p>{error.message}</p>
        </PageError>
      );
    }

    allowedLists = allowedLists.filter(
      list => deniedQueries.indexOf(list.gqlNames.listQueryMetaName) === -1
    );
  }

  return (
    <Fragment>
      <DocTitle title="Home" />
      {
        // NOTE: `loading` is intentionally omitted here
        // the display of a loading indicator for counts is deferred to the
        // list component so we don't block rendering the lists immediately
        // to the user.
      }
      <HomePage lists={allowedLists} data={data} adminPath={adminPath} />
    </Fragment>
  );
};

export default HomepageListProvider;
