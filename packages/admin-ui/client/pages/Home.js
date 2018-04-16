import React, { Fragment } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Container } from '@keystonejs/ui/src/primitives/layout';
import { Title } from '@keystonejs/ui/src/primitives/typography';

const ListContainer = styled.div({
  margin: '8px 0',
});
const ListLink = styled(Link)({
  fontSize: 24,
  margin: '24px 0',
});

const HomePage = ({ lists, listKeys }) => (
  <Fragment>
    <Nav />
    <Container>
      <Title>Home</Title>
      {listKeys.map(key => {
        const list = lists[key];
        return (
          <ListContainer key={key}>
            <ListLink to={`/admin/${list.path}`}>{list.label}</ListLink>
          </ListContainer>
        );
      })}
    </Container>
  </Fragment>
);

export default HomePage;
