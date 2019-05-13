import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import getConfig from 'next/config';

import { useAuth } from '../lib/authetication';
import EventItem from '../components/EventItem';
import { Link } from '../../routes';
import { EVENT_DATA } from './events';

const { publicRuntimeConfig } = getConfig();

export const GET_ALL_EVENTS = gql`
  query GetUpcomingEvents($date: DateTime!) {
    allEvents(where: { startTime_gte: $date }) {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;

export const GET_ALL_SPONSORS = gql`
  {
    allSponsors {
      id
      name
      logo {
        publicUrl
      }
    }
  }
`;

export default function Home() {
  const { meetup } = publicRuntimeConfig;
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <h1>{meetup.name}</h1>
      <h2>Welcome {isAuthenticated ? user.name : ''} </h2>
      <Link route="signin">
        <a>Sign In</a>
      </Link>
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
      <h2>Sponsors</h2>
      <Query query={GET_ALL_SPONSORS}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) {
            console.log(error);
            return <p>Error!</p>;
          }
          return (
            <ul>
              {data.allSponsors.map(sponsor => (
                <li key={sponsor.id}>{sponsor.name}</li>
              ))}
            </ul>
          );
        }}
      </Query>
    </div>
  );
}
