import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import EventItem from '../components/EventItem';
import Navbar from '../components/Navbar';

import { EVENT_DATA } from '../graphql/events';

const GET_ALL_EVENTS = gql`
  {
    allEvents(first: 2) {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;

export default function Events() {
  return (
    <div>
      <Navbar />
      <h1>Events</h1>
      <Query query={GET_ALL_EVENTS}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) {
            console.log(error);
            return <p>Error!</p>;
          }
          return (
            <ul>
              {data.allEvents.map(event => (
                <EventItem key={event.id} {...event} />
              ))}
            </ul>
          );
        }}
      </Query>
    </div>
  );
}
