/** @jsx jsx */

import { jsx } from '@emotion/core';
import Head from 'next/head';
import getConfig from 'next/config';
import { Query } from 'react-apollo';

import { Container, H2 } from '../primitives';
import EventItems from '../components/EventItems';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { colors, gridSize } from '../theme';

import { GET_ALL_EVENTS } from '../graphql/events';

const { publicRuntimeConfig } = getConfig();

export default function Events() {
  const { meetup } = publicRuntimeConfig;

  return (
    <>
      <Head>
        <title>Events | {meetup.name}</title>
      </Head>
      <Navbar background="white" foreground={colors.greyDark} />
      <Container css={{ marginTop: gridSize * 3 }}>
        <H2>Events</H2>
        <Query query={GET_ALL_EVENTS}>
          {({ data, loading, error }) => {
            if (loading) return <p>loading...</p>;
            if (error) {
              console.log(error);
              return <p>Error!</p>;
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
