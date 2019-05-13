import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import EventItem from '../components/EventItem';

export const EVENT_DATA = gql`
  fragment EventData on Event {
    id
    name
    startTime
    description
    talks {
      id
      name
      speakers {
        id
        name
      }
    }
  }
`;

const GET_ALL_EVENTS = gql`
  {
    allEvents {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;

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
