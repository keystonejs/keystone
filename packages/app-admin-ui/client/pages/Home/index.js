import React, { Component, Fragment } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Query } from 'react-apollo';

import { Container, Grid, Cell } from '@arch-ui/layout';
import { PageTitle } from '@arch-ui/typography';

import CreateItemModal from '../../components/CreateItemModal';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { Box, HeaderInset } from './components';
import ContainerQuery from '../../components/ContainerQuery';
import { gqlCountQueries } from '../../classes/List';

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

  if (lists.length === 0) {
    return (
      <Fragment>
        <DocTitle>Home</DocTitle>
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

  const query = gqlCountQueries(lists);
  return (
    <Fragment>
      <DocTitle>Home</DocTitle>
      <Query query={query} fetchPolicy="cache-and-network" errorPolicy="all">
        {({ data, error }) => {
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
          // the display of a loading indicator for counts is defered to the
          // list component so we don't block rendering the lists immediately
          // to the user.

          return <HomePage lists={allowedLists} data={data} {...props} />;
        }}
      </Query>
    </Fragment>
  );
};

export default withRouter(ListProvider);
