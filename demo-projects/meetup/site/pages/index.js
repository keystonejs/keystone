import React from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

export default () => {
  return (
    <Query
      query={gql`
        {
          allMeetups {
            id
            name
            day
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
            {data.allMeetups.map(meetup => (
              <li key={meetup.id}>{meetup.name}</li>
            ))}
          </ul>
        );
      }}
    </Query>
  );
};
