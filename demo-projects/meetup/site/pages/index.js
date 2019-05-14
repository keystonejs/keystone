/** @jsx jsx */
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import { useAuth } from '../lib/authetication';
import EventItem from '../components/EventItem';
import { Link } from '../../routes';
import { EVENT_DATA } from './events';

import { Section, Container, Separator } from '@primitives';
import { colors, fontSizes } from '@root/theme';

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

function Hero({ meetup }) {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <div
        css={{
          backgroundColor: colors.greyDark,
          padding: '7rem 0',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <h1 css={{ fontSize: fontSizes.xxl, marginBottom: 20 }}>{meetup.name}</h1>
        <p css={{ fontSize: fontSizes.md, maxWidth: 720, margin: '0 auto' }}>{meetup.intro}</p>
        <h2>Welcome {isAuthenticated ? user.name : ''} </h2>
        <Link route="signin">
          <a>Sign In</a>
        </Link>
      </div>
    </div>
  );
}

function Slant() {
  return (
    <div css={{ position: 'relative', height: 300 }}>
      <svg viewBox="0 0 100 100" css={{ width: 10, height: 300, position: 'absolute', bottom: 0 }}>
        <polygon id="e1_polygon" points="0 0, 0 100, 100 0" fill={colors.greyDark} />
      </svg>
    </div>
  );
}

function FeaturedEvent() {
  return (
    <Container css={{ margin: '-40px auto 0' }}>
      <div css={{ boxShadow: '0px 4px 94px rgba(0, 0, 0, 0.15)' }}>
        <div css={{ backgroundColor: colors.purple, color: 'white', padding: '2rem' }}>
          <div css={{ display: 'flex' }}>
            <div css={{ flex: 1 }}>
              <h2 css={{ fontSize: fontSizes.lg }}>Community Sourced Scripting!</h2>
            </div>
            <div css={{ flex: 1, padding: '0 2rem' }}>
              <p css={{ lineHeight: 1.5 }}>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. At laborum libero
                repudiandae odit magnam consequuntur possimus quae id necessitatibus, corporis nobis
                molestiae rerum mollitia placeat vel iure magni ducimus quo?
              </p>
            </div>
          </div>
        </div>
        <div css={{ padding: '1rem' }}>
          <div css={{ display: 'flex', justifyContent: 'space-between' }}>
            <div css={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}>
              <span css={{ padding: '0 1rem' }}>Will you be attending?</span>
              <button css={{ marginLeft: '.5rem' }}>yes</button>
              <button css={{ marginLeft: '.5rem' }}>no</button>
            </div>
            <div css={{ display: 'flex', flex: 1, justifyContent: 'flex-end' }}>
              <span css={{ padding: '0 1rem' }}>2 talks</span>
              <span css={{ padding: '0 1rem' }}>84 attending</span>
              <span css={{ padding: '0 1rem' }}>avatars</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Talks() {
  return (
    <Container>
      <div
        css={{ display: 'flex', marginTop: '3rem', marginLeft: '-1.5rem', marginRight: '-1.5rem' }}
      >
        <Talk title="This is the talk title" author="Andrei Calinescu">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi tempore ipsa itaque
          culpa quasi repellendus laborum odio delectus voluptatibus error temporibus perspiciatis
          dolorem facilis, impedit non ratione iure quas magnam?
        </Talk>
        <Talk title="Another awesome talk" author="Jina Doe">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi tempore ipsa itaque
          culpa quasi repellendus laborum odio delectus voluptatibus error temporibus perspiciatis
          dolorem facilis, impedit non ratione iure quas magnam?
        </Talk>
      </div>
    </Container>
  );
}

function Sponsors() {
  return (
    <Container>
      <h3>Our sponsors</h3>
      <ul>
        <li>Atlassian</li>
        <li>Thinkmill</li>
        <li>Lookahead</li>
        <li>Atlassian</li>
      </ul>
    </Container>
  );
}

function Talk({ title, author, children }) {
  return (
    <div css={{ padding: '0 1.5rem' }}>
      <h3>{title}</h3>
      <p>{children}</p>
      <p>
        by <span css={{ fontWeight: 600 }}>{author}</span>
      </p>
    </div>
  );
}

function EventsList({ ...props }) {
  return (
    <Query query={GET_ALL_EVENTS} variables={{ date: new Date().toLocaleDateString() }}>
      {({ data, loading, error }) => {
        if (loading) return <p>loading...</p>;
        if (error) {
          console.log(error);
          return <p>Error!</p>;
        }

        return (
          <ul
            css={{
              listStyle: 'none',
              margin: '0 -1rem',
              padding: 0,
              display: `flex`,
              alignItems: 'flex-start',
            }}
            {...props}
          >
            {data.allEvents.map((event, index) => (
              <EventItem
                key={event.id}
                {...event}
                css={{ width: `${100 / data.allEvents.length}%`, marginTop: index * 80 }}
              />
            ))}
          </ul>
        );
      }}
    </Query>
  );
}

export default function Home() {
  const { meetup } = publicRuntimeConfig;

  return (
    <div>
      <Hero meetup={meetup} />
      {/*<Slant /> */}
      <FeaturedEvent />
      <Talks />

      {/* Sponsors */}
      <Section css={{ padding: '3rem 0' }}>
        <Container>
          <Sponsors />
        </Container>
      </Section>

      {/* More events */}
      <Section css={{ backgroundColor: colors.greyLight, padding: '5rem 0' }}>
        <Container>
          <h2>More Meetup events</h2>
          <Separator />
          <EventsList css={{ marginTop: '3rem' }} />
        </Container>
      </Section>

      <Container>
        <h2>Upcoming Events</h2>

        <h2>Sponsors</h2>
      </Container>
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
