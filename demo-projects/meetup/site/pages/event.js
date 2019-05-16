/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import { Query } from 'react-apollo';
import Head from 'next/head';
import getConfig from 'next/config';

import Rsvp from '../components/Rsvp';
import { Avatar, Container, Hero, H1, H2, Html, Button, Loading } from '../primitives';
import Talks from '../components/Talks';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { colors, fontSizes, gridSize } from '../theme';
import { GET_EVENT_DETAILS } from '../graphql/events';
import { isInFuture, formatFutureDate, formatPastDate } from '../helpers';

const { publicRuntimeConfig } = getConfig();

export default class Event extends Component {
  static async getInitialProps({ query }) {
    const { id } = query;
    return { id };
  }

  render() {
    const { meetup } = publicRuntimeConfig;
    const { id } = this.props;

    return (
      <Query query={GET_EVENT_DETAILS} variables={{ event: id }}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) {
            return <p>Error!</p>;
          }
          if (!data.Event) {
            return <p>Event not found</p>;
          }

          const { description, name, startTime, themeColor, talks } = data.Event;
          const { allRsvps } = data;

          const prettyDate = isInFuture(startTime)
            ? formatFutureDate(startTime)
            : formatPastDate(startTime);

          return (
            <>
              <Head>
                <title>
                  {name} | {meetup.name}
                </title>
              </Head>
              <Navbar foreground="white" background={themeColor} />
              <Hero align="left" backgroundColor={themeColor} superTitle={prettyDate} title={name}>
                <Html markup={description} />
                <Rsvp eventId={id}>
                  {({ loading, error, isGoing, canRsvp, rsvpToEvent }) => {
                    if (loading) return <Loading />;
                    if (error) return <p css={{ color: 'white', margin: 0 }}>{error}</p>;
                    return (
                      <div css={{ display: 'flex', alignItems: 'center' }}>
                        <span css={{ padding: '0' }}>Will you be attending?</span>
                        <Button
                          disabled={isGoing || !canRsvp}
                          outline={isGoing}
                          background={isGoing ? themeColor : colors.greyLight}
                          foreground={isGoing ? 'white' : colors.greyDark}
                          css={{ marginLeft: '.5rem', color: isGoing ? 'white' : colors.greyDark }}
                          onClick={() => rsvpToEvent('yes')}
                        >
                          yes
                        </Button>
                        <Button
                          disabled={!isGoing}
                          outline={!isGoing}
                          background={!isGoing ? themeColor : colors.greyLight}
                          foreground={!isGoing ? 'white' : colors.greyDark}
                          css={{ marginLeft: '.5rem', color: !isGoing ? 'white' : colors.greyDark }}
                          onClick={() => rsvpToEvent('no')}
                        >
                          no
                        </Button>
                      </div>
                    );
                  }}
                </Rsvp>
              </Hero>

              <Container css={{ marginTop: gridSize * 3 }}>
                <H2>Talks</H2>
                <Talks talks={talks} />

                <div css={{ textAlign: 'center', marginTop: '3em' }}>
                  <H1 as="h3">{allRsvps.length}</H1>
                  <div css={{ fontSize: fontSizes.md }}>
                    {isInFuture(startTime)
                      ? 'People are attending this meetup'
                      : 'People attended this meetup'}
                  </div>

                  <div
                    css={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      marginTop: '3em',
                    }}
                  >
                    {allRsvps
                      .filter(rsvp => rsvp.user)
                      .map(rsvp => (
                        <div key={rsvp.id} css={{ marginLeft: '0.25em', marginRight: '0.25em' }}>
                          <Avatar
                            alt={`${rsvp.user.name} Avatar`}
                            name={rsvp.user.name}
                            src={rsvp.user.image && rsvp.user.image.small}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </Container>
              <Footer />
            </>
          );
        }}
      </Query>
    );
  }
}
