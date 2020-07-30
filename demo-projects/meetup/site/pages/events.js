/** @jsx jsx */

import { jsx } from '@emotion/core';

import { useQuery } from '@apollo/react-hooks';

import { Container, Loading, H2 } from '../primitives';
import EventItems from '../components/EventItems';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { gridSize } from '../theme';
import { initializeApollo } from '../lib/apolloClient';

import { GET_ALL_EVENTS } from '../graphql/events';

export default function Events() {
  const { data: { allEvents } = {}, loading, error } = useQuery(GET_ALL_EVENTS);

  if (error) {
    console.error('Failed to load events', error);
  }

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
export async function getStaticProps() {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: GET_ALL_EVENTS,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
    revalidate: 1,
  };
}
