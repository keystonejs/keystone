import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { useAuth } from '../lib/authetication';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <h1>Welcome {isAuthenticated ? user.name : ''} </h1>
      <a href="/signin">Sign In</a>
      <Query
        query={gql`
          {
            allEvents {
              id
              name
              startDate
              description
              talks {
                name
                speakers {
                  name
                }
              }
            }
          }
        `}
      >
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) {
            console.log(error);
            return <p>Error!</p>;
          }
          return (
            <ul>
              {data.allEvents.map(event => (
                <li key={event.id}>{event.name}</li>
              ))}
            </ul>
          );
        }}
      </Query>
    </div>
  );
}
