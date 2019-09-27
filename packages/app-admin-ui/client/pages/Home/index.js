import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import { Container, Grid, Cell } from '@arch-ui/layout';
import { PageTitle } from '@arch-ui/typography';

import CreateItemModal from '../../components/CreateItemModal';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { Box, HeaderInset } from './components';
import ContainerQuery from '../../components/ContainerQuery';
import { gqlCountQueries } from '../../classes/List';

const emptyCountQuery = gql`
  {
    _ksListsMeta {
      name
    }
  }
`;

class HomePage extends Component {
  state = { createFromList: null };

  openCreateModal = createFromList => event => {
    event.preventDefault();
    this.setState({ createFromList });
  };
  closeCreateModal = () => this.setState({ createFromList: null });

  onCreate = list => ({ data }) => {
    let { adminPath, history } = this.props;
    let id = data[list.gqlNames.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
  };

  render() {
    const { lists, data, adminPath } = this.props;
    const { createFromList } = this.state;

    return (
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
                      <Fragment key={key}>
                        <Cell width={cellWidth}>
                          <Box
                            list={list}
                            to={`${adminPath}/${path}`}
                            meta={meta}
                            onCreateClick={this.openCreateModal(key)}
                          />
                        </Cell>
                        <CreateItemModal
                          isOpen={createFromList === key}
                          list={list}
                          onClose={this.closeCreateModal}
                          onCreate={this.onCreate(list)}
                        />
                      </Fragment>
                    );
                  })}
                </Grid>
              );
            }}
          </ContainerQuery>
        </Container>
      </main>
    );
  }
}

const ListProvider = ({ getListByKey, listKeys, ...props }) => {
  // TODO: A permission query to limit which lists are visible
  const lists = listKeys.map(key => getListByKey(key));

  const query = lists.length ? gqlCountQueries(lists) : emptyCountQuery;
  const { data, error } = useQuery(query, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    skip: !lists.length,
  });

  if (lists.length === 0) {
    return (
      <Fragment>
        <DocTitle>Home</DocTitle>
        <PageError>
          <p>
            No lists defined.{' '}
            <a href="https://v5.keystonejs.com/guides/add-lists" target="_blank">
              Get started by creating your first list.
            </a>
          </p>
        </PageError>
      </Fragment>
    );
  }

  let deniedQueries = [];
  if (error) {
    if (!error.graphQLErrors || !error.graphQLErrors.length) {
      return (
        <PageError>
          <p>{error.message}</p>
        </PageError>
      );
    }

    deniedQueries = error.graphQLErrors
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
  }

  // NOTE: `loading` is intentionally omitted here
  // the display of a loading indicator for counts is defered to the
  // list component so we don't block rendering the lists immediately
  // to the user.
  const allowedLists = lists.filter(
    list => deniedQueries.indexOf(list.gqlNames.listQueryMetaName) === -1
  );

  return (
    <Fragment>
      <DocTitle>Home</DocTitle>
      <HomePage lists={allowedLists} data={data} {...props} />
    </Fragment>
  );
};

export default withRouter(ListProvider);
