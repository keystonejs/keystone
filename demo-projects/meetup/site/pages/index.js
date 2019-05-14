import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import getConfig from 'next/config';

import { useAuth } from '../lib/authetication';
import EventItem from '../components/EventItem';
import { Link } from '../../routes';
import { EVENT_DATA } from './events';

const { publicRuntimeConfig } = getConfig();

export const GET_EVENTS_AND_SPONSORS = gql`
  query {
    allEvents(where: { startTime_not: null }, orderBy: "startTime") {
      ...EventData
    }
    allSponsors {
      id
      name
      logo {
        publicUrl
      }
    }
  }
  ${EVENT_DATA}
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
      <Query query={GET_EVENTS_AND_SPONSORS}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) {
            console.log(error);
            return <p>Error!</p>;
          }
          const { allEvents, allSponsors } = data;
          const now = Date.now();

          let eventItem = null;
          if (allEvents.length) {
            if (allEvents.length === 1 || new Date(allEvents[0].startTime) < now) {
              eventItem = <EventItem {...allEvents[0]} />;
            } else {
              for (let i = 0; i < allEvents.length; i++) {
                if (i === allEvents.length - 1 || new Date(allEvents[i].startTime) < now) {
                  eventItem = <EventItem {...allEvents[i - 1]} />;
                  break;
                }
              }
            }
          }

          return (
            <>
              <ul>{eventItem}</ul>

              <h2>Sponsors</h2>
              <ul>
                {allSponsors.map(sponsor => (
                  <li key={sponsor.id}>{sponsor.name}</li>
                ))}
              </ul>
            </>
          );
        }}
      </Query>
    </div>
  );
}
