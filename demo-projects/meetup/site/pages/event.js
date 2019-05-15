/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import { Query } from 'react-apollo';

import Rsvp from '../components/Rsvp';
import { GET_EVENT_DETAILS } from '../graphql/events';

export default class Event extends Component {
  static async getInitialProps({ query }) {
    const { id } = query;
    return { id };
  }

  render() {
    const { id } = this.props;

    return (
      <Query query={GET_EVENT_DETAILS} variables={{ event: id }}>
        {({ data, loading, error }) => {
          if (loading) return <p>loading...</p>;
          if (error) {
            console.log(error);
            return <p>Error!</p>;
          }
          if (!data.Event) {
            return <p>Event not found</p>;
          }

          const { name, startTime, talks } = data.Event;
          const { allRsvps } = data;

          return (
            <div>
              <h2>{name}</h2>
              <p>{startTime}</p>
              <Rsvp id={id} />
              <h2>Talks</h2>
              {talks.map(talk => (
                <div key={talk.id}>
                  <h3>{talk.name}</h3>
                  <h3>Speakers</h3>
                  {talk.speakers.map(speaker =>
                    speaker ? (
                      <div key={speaker.id}>
                        <img alt={speaker.name} src={speaker.image.publicUrl} />
                        <p>{speaker.name}</p>
                      </div>
                    ) : null
                  )}
                </div>
              ))}
              <h2>People who attended this meetup</h2>
              {allRsvps
                .filter(rsvp => rsvp.user && rsvp.user.image && rsvp.user.image.publicUrl)
                .map(rsvp => (
                  <img
                    css={{ width: '200px', height: '200px' }}
                    key={rsvp.id}
                    alt={rsvp.user.name}
                    src={rsvp.user.image.publicUrl}
                  />
                ))}
            </div>
          );
        }}
      </Query>
    );
  }
}
