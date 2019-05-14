import React from 'react';
import { Query } from 'react-apollo';
import EventItem from '../components/EventItem';

import { GET_ALL_EVENTS } from '../graphql/events';

export default function Events() {
  return (
    <div>
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
