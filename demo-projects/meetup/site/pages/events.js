/** @jsx jsx */

import { jsx } from '@emotion/core';

import { useQuery } from '@apollo/react-hooks';

import { Container, Loading, H2 } from '../primitives';
import EventItems from '../components/EventItems';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { gridSize } from '../theme';

import { GET_ALL_EVENTS } from '../graphql/events';

export default function Events() {
  const { data, loading, error } = useQuery(GET_ALL_EVENTS);
  if (error) {
    console.error('Failed to load events', error);
  }
  const { allEvents } = data;
  return (
    <>
      <Meta title="Events" />
      <Navbar background="white" />
      <Container css={{ marginTop: gridSize * 3 }}>
        <H2>Events</H2>
        {loading ? (
          <Loading isCentered size="xlarge" />
        ) : error ? (
          <p>Something went wrong. Please try again.</p>
        ) : (
          <EventItems events={allEvents} />
        )}
      </Container>
      <Footer />
    </>
  );
}
