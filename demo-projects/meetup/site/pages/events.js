/** @jsx jsx */

import { jsx } from '@emotion/core';
import { Query } from 'react-apollo';

import { Container, H2 } from '../primitives';
import EventItem from '../components/EventItem';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { colors, gridSize } from '../theme';

import { GET_ALL_EVENTS } from '../graphql/events';

export default function Events() {
  return (
    <>
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
            return (
              <ul css={{ margin: `${gridSize * 6}px 0`, padding: 0 }}>
                {data.allEvents.map(event => (
                  <EventItem key={event.id} {...event} />
                ))}
              </ul>
            );
          }}
        </Query>
      </Container>
      <Footer />
    </>
  );
}
