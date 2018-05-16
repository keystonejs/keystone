import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import Media from 'react-media';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PlusIcon } from '@keystonejs/icons';
import { Container, Grid, Cell } from '@keystonejs/ui/src/primitives/layout';
import { A11yText, Title } from '@keystonejs/ui/src/primitives/typography';

import CreateItemModal from '../../components/CreateItemModal';
import Nav from '../../components/Nav';
import { Box, Count, CreateButton, Name } from './components';

const getQuery = list => gql`{ ${list.listQueryMetaName} { count } }`;

class HomePage extends Component {
  state = { activeList: null, createFromList: null };
  selectActive = activeList => event => {
    if (event.target.nodeName === 'BUTTON') return;
    this.setState({ activeList });
  };
  deselectActive = () => {
    this.setState({ activeList: '' });
  };

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
    const { getListByKey, listKeys, adminPath } = this.props;
    const { createFromList, activeList } = this.state;

    return (
      <Fragment>
        <Nav />
        <Container>
          <Title>Home</Title>
          <Grid gap={16}>
            {listKeys.map(key => {
              const list = getListByKey(key);
              const query = getQuery(list);

              return (
                <Fragment key={key}>
                  <Query query={query} fetchPolicy="cache-and-network">
                    {({ data, error }) => {
                      if (error) {
                        return (
                          <Fragment>
                            <Title>Error</Title>
                            <p>{error.message}</p>
                          </Fragment>
                        );
                      }

                      const isActive = activeList === key;
                      const listMeta = data && data[list.listQueryMetaName];

                      return (
                        <Media query={{ maxWidth: 768 }}>
                          {isSmall => (
                            <Cell width={isSmall ? 6 : 3}>
                              <Box
                                to={`${adminPath}/${list.path}`}
                                onMouseEnter={this.selectActive(key)}
                                onMouseLeave={this.deselectActive}
                                onFocus={this.selectActive(key)}
                                onBlur={this.deselectActive}
                              >
                                <Name isHover={isActive}>{list.label}</Name>
                                <Count meta={listMeta} />
                                <CreateButton
                                  isHover={isActive}
                                  onClick={this.openCreateModal(key)}
                                >
                                  <PlusIcon />
                                  <A11yText>Create {list.singular}</A11yText>
                                </CreateButton>
                              </Box>
                            </Cell>
                          )}
                        </Media>
                      );
                    }}
                  </Query>
                  {createFromList === key ? (
                    <CreateItemModal
                      list={list}
                      onClose={this.closeCreateModal}
                      onCreate={this.onCreate(list)}
                    />
                  ) : null}
                </Fragment>
              );
            })}
          </Grid>
        </Container>
      </Fragment>
    );
  }
}

export default withRouter(HomePage);
