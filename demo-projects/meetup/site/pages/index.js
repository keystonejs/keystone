import React from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

export default () => {
  return (
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
              speaker {
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
  );
};
