import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { useAuth } from '../lib/authetication';
import EventItem from '../components/EventItem';
<<<<<<< HEAD
import { Link } from '../../routes';
=======
>>>>>>> master
import { EVENT_DATA } from './events';

export const GET_ALL_EVENTS = gql`
  query GetUpcomingEvents($date: DateTime!) {
    allEvents(where: { startDate_gte: $date }) {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <h1>Welcome {isAuthenticated ? user.name : ''} </h1>
<<<<<<< HEAD
      <Link route="signin">
        <a>Sign In</a>
      </Link>
=======
      <a href="/signin">Sign In</a>
>>>>>>> master
      <h2>Upcoming Events</h2>
      <Query query={GET_ALL_EVENTS} variables={{ date: new Date().toLocaleDateString() }}>
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
