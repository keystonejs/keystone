/** @jsx jsx */
import { Query } from 'react-apollo';
import getConfig from 'next/config';
import Head from 'next/head';
import { jsx } from '@emotion/core';

import EventItems from '../components/EventItems';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GET_CURRENT_EVENTS } from '../graphql/events';
import { GET_SPONSORS } from '../graphql/sponsors';

import Talks from '../components/Talks';
import Rsvp from '../components/Rsvp';
import { Hero, Section, Container, Separator, Loading, Error } from '../primitives';
import { H2, H3 } from '../primitives/Typography';
import { colors, gridSize } from '../theme';
import { isInFuture, formatFutureDate, formatPastDate } from '../helpers';
import { Component } from 'react';

const { publicRuntimeConfig } = getConfig();
/**
 * Featured Event
 * */
const FeaturedEvent = ({ isLoading, error, event }) => {
  if (isLoading && !event) {
    return <p>Special loading message for featured event</p>;
  }
  if (error) {
    return <p>special featured events error</p>;
  }
  if (!isLoading && !event) {
    return <p>No events to show.</p>;
  }

  const { startTime, id } = event;
  const prettyDate = isInFuture(startTime)
    ? formatFutureDate(startTime)
    : formatPastDate(startTime);
  return (
    <Container css={{ margin: '-7rem auto 0', position: 'relative' }}>
      <div css={{ boxShadow: '0px 4px 94px rgba(0, 0, 0, 0.15)' }}>
        <div css={{ backgroundColor: colors.purple, color: 'white', padding: '2rem' }}>
          <div css={{ display: 'flex' }}>
            <div css={{ flex: 1 }}>
              <p
                css={{
                  textTransform: 'uppercase',
                  marginTop: 0,
                  fontWeight: 500,
                  marginBottom: gridSize,
                }}
              >
                {prettyDate}
              </p>
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
              <Rsvp eventId={id} />
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

const Sponsors = () => {
  return (
    <Container css={{ textAlign: 'center' }}>
      <H3>Our sponsors</H3>
      <Query query={GET_SPONSORS}>
        {({ data, loading, error }) => {
          if (loading) return <Loading />;
          if (error) return <Error error={error} />;

          const { allSponsors } = data;
          return (
            <ul
              css={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                listStyle: 'none',
                padding: 0,
              }}
            >
              {allSponsors.map(sponsor => (
                <li key={sponsor.id} css={{ flex: 1, margin: 12 }}>
                  <a href={sponsor.website} target="_blank">
                    {sponsor.logo ? (
                      <img
                        alt={sponsor.name}
                        css={{ maxWidth: '100%', maxHeight: 140 }}
                        src={sponsor.logo.publicUrl}
                      />
                    ) : (
                      sponsor.name
                    )}
                  </a>
                </li>
              ))}
            </ul>
          );
        }}
      </Query>
    </Container>
  );
};

const EventsList = ({ events, ...props }) => {
  return <EventItems events={events} {...props} />;
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
    const { meetup } = publicRuntimeConfig;

    return (
      <Query query={GET_CURRENT_EVENTS} variables={{ now }}>
        {({ data: eventsData, loading: eventsLoading, error: eventsError }) => {
          const { featuredEvent, moreEvents } = processEventsData(eventsData);
          return (
            <div>
              <Head>
                <title>{meetup.name}</title>
                <meta name="description" content={meetup.intro} />
              </Head>
              <Navbar foreground="white" background={colors.greyDark} />
              <Hero title={meetup.name}>{meetup.intro}</Hero>
              <FeaturedEvent isLoading={eventsLoading} error={eventsError} event={featuredEvent} />
              <Container css={{ marginTop: '3rem' }}>
                {featuredEvent && featuredEvent.talks ? (
                  <Talks talks={featuredEvent.talks} />
                ) : null}
              </Container>
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
              <Footer />
            </div>
          );
        }}
      </Query>
    );
  }
}
