import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import Media from 'react-media';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { Container, Grid, Cell } from '@keystonejs/ui/src/primitives/layout';
import { H1 } from '@keystonejs/ui/src/primitives/typography';

import CreateItemModal from '../../components/CreateItemModal';
import Nav from '../../components/Nav';
import DocTitle from '../../components/DocTitle';
import PageError from '../../components/PageError';
import { Box } from './components';

const getQuery = lists => gql`{
  ${lists.map(list => `${list.listQueryMetaName} { count }`)}
}`;

class HomePage extends Component {
  state = { createFromList: null };

  openCreateModal = createFromList => event => {
    event.preventDefault();
    this.setState({ createFromList });
  };
  closeCreateModal = () => this.setState({ createFromList: null });

  onCreate = list => ({ data }) => {
    let { adminPath, history } = this.props;
    let id = data[list.createMutationName].id;
    history.push(`${adminPath}/${list.path}/${id}`);
  };

  render() {
    const { lists, data, adminPath } = this.props;
    const { createFromList } = this.state;

    return (
      <main>
        <Container>
          <H1>Home</H1>
          <Grid gap={16}>
            {lists.map(list => {
              const { key, path } = list;
              const meta = data && data[list.listQueryMetaName];

              return (
                <Fragment key={key}>
                  <Media query={{ maxWidth: 768 }}>
                    {isSmall => (
                      <Cell width={isSmall ? 6 : 3}>
                        <Box
                          list={list}
                          to={`${adminPath}/${path}`}
                          meta={meta}
                          onCreateClick={this.openCreateModal(key)}
                        />
                      </Cell>
                    )}
                  </Media>
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
        </Container>
      </main>
    );
  }
}

const ListProvider = ({ getListByKey, listKeys, ...props }) => {
  // TODO: A permission query to limit which lists are visible
  const lists = listKeys.map(key => getListByKey(key));
  const query = getQuery(lists);

  return (
    <Fragment>
      <Nav />
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
              list => deniedQueries.indexOf(list.listQueryMetaName) === -1
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
