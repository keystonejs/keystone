import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { useAuth } from '../lib/authetication';
import EventItem from '../components/EventItem';

const GET_ALL_EVENTS = gql`
  {
    allEvents {
      id
      name
      startDate
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
  }
`;

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <h1>Welcome {isAuthenticated ? user.name : ''} </h1>
      <a href="/signin">Sign In</a>
      <Query query={GET_ALL_EVENTS}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) {
            console.log(error);
            return <p>Error!</p>;
          }
          return (
            <ul>
              {data.allEvents.map(event => <EventItem key={event.id} {...event} />)}
            </ul>
          );
        }}
      </Query>
    </div>
  );
}
