/** @jsx jsx */
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import EventItem from '../components/EventItem';
import CallToAction from '../components/CallToAction';
import { EVENT_DATA } from '../graphql/events';

import { Section, Container, Separator, Button, Loading, Error } from '../primitives';
import { H1, H2, H3 } from '../primitives/Typography';
import { colors, fontSizes } from '../theme';

const { publicRuntimeConfig } = getConfig();

export const GET_EVENTS = gql`
  query {
    allEvents(where: { startTime_not: null }, orderBy: "startTime") {
      ...EventData
    }
  }
  ${EVENT_DATA}
`;

const GET_SPONSORS = gql`
  query {
    allSponsors {
      id
      name
      logo {
        publicUrl
      }
    }
  }
`;

function Hero() {
  const { meetup } = publicRuntimeConfig;

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
        <H1>{meetup.name}</H1>
        <p css={{ fontSize: fontSizes.md, maxWidth: 720, margin: '30px auto 0' }}>{meetup.intro}</p>
      </div>
    </div>
  );
}

function Slant() {
  return (
    <svg
      css={{ height: '5vw', width: '100vw' }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polygon fill={colors.greyDark} points="0, 100 0, 0 100, 0" />
    </svg>
  );
}

function FeaturedEvent() {
  return (
    <Container css={{ margin: '-7rem auto 0', position: 'relative' }}>
      <div css={{ boxShadow: '0px 4px 94px rgba(0, 0, 0, 0.15)' }}>
        <div css={{ backgroundColor: colors.purple, color: 'white', padding: '2rem' }}>
          <div css={{ display: 'flex' }}>
            <div css={{ flex: 1 }}>
              <H3>Community Sourced Scripting!</H3>
            </div>
            <div css={{ flex: 1, padding: '0 2rem' }}>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. At laborum libero
                repudiandae odit magnam consequuntur possimus quae id necessitatibus, corporis nobis
                molestiae rerum mollitia placeat vel iure magni ducimus quo?
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. At laborum libero
                repudiandae odit magnam consequuntur possimus quae id necessitatibus, corporis nobis
                molestiae rerum mollitia placeat vel iure magni ducimus quo?
              </p>
            </div>
          </div>
        </div>
        <div css={{ padding: '1.5rem', background: 'white' }}>
          <div css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              css={{ display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}
            >
              <span css={{ padding: '0 1rem' }}>Will you be attending?</span>
              <Button color={colors.purple} css={{ marginLeft: '.5rem' }}>
                yes
              </Button>
              <Button color={colors.purple} css={{ marginLeft: '.5rem' }}>
                no
              </Button>
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
      <Query query={GET_SPONSORS}>
        {({ data, loading, error }) => {
          if (loading) return <Loading />;
          if (error) return <Error error={error} />;

          const { allSponsors } = data;
          return (
            <ul>
              {allSponsors.map(sponsor => (
                <li key={sponsor.id}>{sponsor.name}</li>
              ))}
            </ul>
          );
        }}
      </Query>
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
    <Query query={GET_EVENTS} variables={{ date: new Date().toLocaleDateString() }}>
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
  return (
    <div>
      <Hero />
      <Slant />
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
          <H2>More Meetup events</H2>
          <Separator css={{ marginTop: 30 }} />
          <EventsList css={{ marginTop: '3rem' }} />
        </Container>
      </Section>

      <Section css={{ margin: '5rem 0' }}>
        <CallToAction />
      </Section>

      <Section css={{ margin: '5rem 0' }}>
        <Container>
          <h2>Below is // TODO:</h2>
        </Container>
      </Section>
      <Query query={GET_EVENTS}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) {
            console.log(error);
            return <p>Error!</p>;
          }
          const { allEvents } = data;
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

          return <ul>{eventItem}</ul>;
        }}
      </Query>
    </div>
  );
}
