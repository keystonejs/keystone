import React, { useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';

import { Container, Grid, Cell } from '@arch-ui/layout';
import { PageTitle } from '@arch-ui/typography';

import { ListProvider } from '../../providers/List';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { Box, HeaderInset } from './components';

import { useAdminMeta } from '../../providers/AdminMeta';

import useResizeObserver from 'use-resize-observer';
import throttle from 'lodash.throttle';

const getCountQuery = lists => {
  if (!lists) return null;

  return gql`
    query getAllListCounts {
      ${lists.map(({ gqlNames }) => `${gqlNames.listQueryMetaName} { count }`).join('\n')}
    }
  `;
};

const Homepage = () => {
  const { getListByKey, listKeys, adminPath } = useAdminMeta();

  // TODO: A permission query to limit which lists are visible
  const lists = listKeys.map(key => getListByKey(key));

  const { data, error } = useQuery(getCountQuery(lists), {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const [cellWidth, setCellWidth] = useState(3);

  // Restrict size updates to ~15 FPS (60ms)
  const throttledSetCellWidth = useMemo(() => throttle(setCellWidth, 60), []);

  const { ref: measureElement } = useResizeObserver({
    onResize: ({ width }) => {
      // requestAnimationFrame works around a weird 'ResizeObserver loop limit exceeded' error.
      // See https://stackoverflow.com/a/50387233 and https://github.com/WICG/ResizeObserver/issues/38.
      window.requestAnimationFrame(() =>
        throttledSetCellWidth(width < 480 ? 12 : width < 768 ? 6 : width < 1024 ? 4 : 3)
      );
    },
  });

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

  // NOTE: `loading` is intentionally omitted here
  // the display of a loading indicator for counts is deferred to the
  // list component so we don't block rendering the lists immediately
  // to the user.
  return (
    <main>
      <DocTitle title="Home" />
      <Container>
        <HeaderInset>
          <PageTitle>Dashboard</PageTitle>
        </HeaderInset>
        <Grid ref={measureElement} gap={16}>
          {allowedLists.map(list => {
            const { key, path } = list;
            const meta = data && data[list.gqlNames.listQueryMetaName];
            return (
              <ListProvider list={list} key={key} skipQuery>
                <Cell width={cellWidth}>
                  <Box to={`${adminPath}/${path}`} meta={meta} />
                </Cell>
              </ListProvider>
            );
          })}
        </Grid>
      </Container>
    </main>
  );
};

export default Homepage;
