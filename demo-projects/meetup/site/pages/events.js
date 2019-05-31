/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Query } from 'react-apollo';

import { Container, Loading, H2 } from '../primitives';
import EventItems from '../components/EventItems';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { gridSize } from '../theme';

import { GET_ALL_EVENTS } from '../graphql/events';

export default function Events() {
  return (
    <>
      <Meta title="Events" />
      <Navbar background="white" />
      <Container css={{ marginTop: gridSize * 3 }}>
        <H2>Events</H2>
        <Query query={GET_ALL_EVENTS}>
          {({ data, loading, error }) => {
            if (loading) {
              return <Loading isCentered size="xlarge" />;
            }

            if (error) {
              console.error('Failed to load events', error);
              return <p>Something went wrong. Please try again.</p>;
            }

            const { allEvents } = data;
            return <EventItems events={allEvents} />;
          }}
        </Query>
      </Container>
      <Footer />
    </>
  );
}
