import React, { Component, Fragment } from 'react';
import styled from 'react-emotion';
import { Link, withRouter } from 'react-router-dom';
import Media from 'react-media';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import CreateItemModal from '../components/CreateItemModal';
import Nav from '../components/Nav';
import { PlusIcon } from '@keystonejs/icons';
import { Container, Grid, Cell } from '@keystonejs/ui/src/primitives/layout';
import { A11yText, Title } from '@keystonejs/ui/src/primitives/typography';
import { LoadingIndicator } from '@keystonejs/ui/src/primitives/loading';
import { colors, gridSize } from '@keystonejs/ui/src/theme';

const getQuery = list => gql`{ ${list.listQueryName} { id } }`;
const BOX_GUTTER = `${gridSize * 2}px`;

const Box = styled(Link)`
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.075), 0 0 0 1px rgba(0, 0, 0, 0.1);
  color: ${colors.N40};
  display: block;
  line-height: 1.1;
  padding: ${BOX_GUTTER};
  position: relative;
  transition: box-shadow 80ms linear;

  &:hover {
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.075), 0 0 0 1px ${colors.B.A50};
    text-decoration: none;
  }
  &:focus {
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.075), 0 0 0 1px ${colors.B.A50};
    outline: 0;
  }
`;

const Name = styled.span(
  ({ isHover }) => `
  border-bottom: 1px solid ${isHover ? colors.B.A50 : 'transparent'};
  color: ${colors.primary};
  display: inline-block;
  font-size: 1.1em;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: border-color 80ms linear;
  white-space: nowrap;
`
);
const Count = styled.div`
  font-size: 0.85em;
`;
const CreateButton = styled.button(
  ({ isHover }) => `
  align-items: center;
  background-color: ${isHover ? colors.N20 : colors.N10};
  border-radius: 2px;
  border: 0;
  color: white;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  outline: 0;
  position: absolute;
  right: ${BOX_GUTTER};
  top: ${BOX_GUTTER};
  transition: background-color 80ms linear;
  width: 24px;

  &:hover, &:focus {
    background-color: ${colors.create};
  }
`
);

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
                      const items = data && data[list.listQueryName];
                      const count = items && items.length;
                      const countElement = count ? (
                        `${count} Item${count !== 1 ? 's' : ''}`
                      ) : (
                        <LoadingIndicator />
                      );

                      return (
                        <Media query={{ maxWidth: 599 }}>
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
                                <Count isHover={isActive}>{countElement}</Count>
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
