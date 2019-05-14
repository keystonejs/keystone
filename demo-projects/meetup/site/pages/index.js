/** @jsx jsx */
import { Query } from 'react-apollo';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import EventItem from '../components/EventItem';
import CallToAction from '../components/CallToAction';
import { GET_CURRENT_EVENTS } from '../graphql/events';
import { GET_SPONSORS } from '../graphql/sponsors';

import { Section, Container, Separator, Button, Loading, Error } from '../primitives';
import { H1, H2, H3 } from '../primitives/Typography';
import { colors, fontSizes } from '../theme';
import { Component } from 'react';

const { publicRuntimeConfig } = getConfig();

const Hero = () => {
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
};

const Slant = () => {
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
};

const FeaturedEvent = ({ isLoading, error, event }) => {
  if (isLoading && !event) {
    return <p>Special loading message for featured event</p>;
  }
  if (error) {
    return <p>special featured events error</p>;
  }
  if (!isLoading && !error && !event) {
    return <p>No events to show.</p>;
  }

  return (
    <Container css={{ margin: '-7rem auto 0', position: 'relative' }}>
      <div css={{ boxShadow: '0px 4px 94px rgba(0, 0, 0, 0.15)' }}>
        <div css={{ backgroundColor: colors.purple, color: 'white', padding: '2rem' }}>
          <div css={{ display: 'flex' }}>
            <div css={{ flex: 1 }}>
              <H3>{event.name}</H3>
            </div>
            <div
              css={{ flex: 1, padding: '0 2rem' }}
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
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
              <span css={{ padding: '0 1rem' }}>{event.talks.length} talks</span>
              <span css={{ padding: '0 1rem' }}>84 attending</span>
              <span css={{ padding: '0 1rem' }}>avatars</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

const Talks = ({ talks }) => {
  return (
    <Container>
      <div
        css={{ display: 'flex', marginTop: '3rem', marginLeft: '-1.5rem', marginRight: '-1.5rem' }}
      >
        {talks.map(talk => (
          <Talk {...talk} />
        ))}
      </div>
    </Container>
  );
};

const Sponsors = () => {
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
};

const Talk = ({ title, description, speakers }) => {
  return (
    <div css={{ padding: '0 1.5rem' }}>
      <h3>{title}</h3>
      <p dangerouslySetInnerHTML={{ __html: description }} />
      <p>
        {speakers.map(speaker => (
          <span css={{ fontWeight: 600 }}>{speaker.author}</span>
        ))}
      </p>
    </div>
  );
};

const EventsList = ({ events, ...props }) => {
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
      {events.map((event, index) => (
        <EventItem
          key={event.id}
          {...event}
          css={{ width: `${100 / events.length}%`, marginTop: index * 80 }}
        />
      ))}
    </ul>
  );
};

function processEventsData(data) {
  if (!data || !data.upcomingEvents || !data.previousEvents) {
    return {
      featuredEvent: null,
      moreEvents: [],
    };
  }

  const upcomingEvents = data.upcomingEvents.slice();
  const previousEvents = data.previousEvents.slice();

  const featuredEvent = upcomingEvents.length ? upcomingEvents.pop() : previousEvents.pop() || null;
  const moreEvents = [];

  for (let i = 0; i < 3; i++) {
    if (upcomingEvents.length) {
      moreEvents.push(upcomingEvents.pop());
    } else if (previousEvents.length) {
      moreEvents.push(previousEvents.pop());
    }
  }

  return {
    featuredEvent,
    moreEvents,
  };
}

export default class Home extends Component {
  static getInitialProps() {
    return {
      now: new Date().toISOString(),
    };
  }

  render() {
    const now = this.props.now;
    return (
      <Query query={GET_CURRENT_EVENTS} variables={{ now }}>
        {({ data: eventsData, loading: eventsLoading, error: eventsError }) => {
          const { featuredEvent, moreEvents } = processEventsData(eventsData);
          console.log(eventsData, eventsLoading, eventsError);
          return (
            <div>
              <Hero />
              <Slant />
              <FeaturedEvent isLoading={eventsLoading} error={eventsError} event={featuredEvent} />;
              {featuredEvent && featuredEvent.talks ? <Talks talks={featuredEvent.talks} /> : null}
              <Section css={{ padding: '3rem 0' }}>
                <Container>
                  <Sponsors />
                </Container>
              </Section>
              {moreEvents.length ? (
                <Section css={{ backgroundColor: colors.greyLight, padding: '5rem 0' }}>
                  <Container>
                    <H2>More Meetup events</H2>
                    <Separator css={{ marginTop: 30 }} />
                    <EventsList events={moreEvents} css={{ marginTop: '3rem' }} />
                  </Container>
                </Section>
              ) : null}
              <Section css={{ margin: '5rem 0' }}>
                <CallToAction />
              </Section>
            </div>
          );
        }}
      </Query>
    );
  }
}
