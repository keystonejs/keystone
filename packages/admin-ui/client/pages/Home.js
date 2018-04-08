import React, { Fragment } from 'react';
import styled from 'react-emotion';
import { Link } from 'react-router-dom';

import Nav from '../components/Nav';
import { Page } from '../primitives/layout';
import { Title } from '../primitives/typography';

const ListLink = styled(Link)`
  margin: 24px 0;
  font-size: 24px;
`;

const HomePage = ({ lists, listKeys }) => (
  <Fragment>
    <Nav />
    <Page>
      <Title>Home</Title>
      {listKeys.map(key => {
        const list = lists[key];
        return (
          <ListLink key={key} to={`/admin/${list.path}`}>
            {list.label}
          </ListLink>
        );
      })}
    </Page>
  </Fragment>
);

export default HomePage;
