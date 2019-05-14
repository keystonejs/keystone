import React from 'react';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { useAuth } from '../lib/authetication';

const ADD_RSVP = gql`
  mutation AddRsvp($event: ID!, $user: ID!, $status: RsvpStatusType!) {
    createRsvp(
      data: {
        event: { connect: { id: $event } }
        user: { connect: { id: $user } }
        status: $status
      }
    ) {
      id
      event {
        id
      }
      status
    }
  }
`;

const UPDATE_RSVP = gql`
  mutation UpdateRSVP($rsvp: ID!, $status: RsvpStatusType!) {
    updateRsvp(id: $rsvp, data: { status: $status }) {
      id
      event {
        id
      }
      status
    }
  }
`;

const GET_RSVPS = gql`
  query GetRsvps($event: ID!, $user: ID!) {
    eventRsvps: allRsvps(where: { event: { id: $event }, status: yes }) {
      id
    }
    userRsvps: allRsvps(where: { event: { id: $event }, user: { id: $user } }) {
      id
      status
    }
    event: Event(where: { id: $event }) {
      id
      startTime
      maxRsvps
    }
  }
`;

const Rsvp = ({ id }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <p>please login to RSVP</p>;
  }

  return (
    <Query query={GET_RSVPS} variables={{ event: id, user: user.id }}>
      {({ data, loading, error }) => {
        if (loading) return <p>loading...</p>;
        if (error) {
          console.log(error);
          return <p>Error!</p>;
        }

        const { userRsvps, eventRsvps, event } = data;

        return (
          <Mutation
            mutation={userRsvps[0] ? UPDATE_RSVP : ADD_RSVP}
            refetchQueries={() => [
              {
                query: GET_RSVPS,
                variables: { event: id, user: user.id },
              },
            ]}
          >
            {(updateRsvp, { error: mutationError }) => {
              if (new Date() > new Date(event.startTime)) {
                return <p>You can no longer rsvp to this event</p>;
              }

              if (
                event.maxRsvps !== null &&
                eventRsvps.length >= event.maxRsvps &&
                !userRsvps.length
              ) {
                return <p>You can no longer rsvp to this event</p>;
              }

              let variables = {
                rsvp: userRsvps[0] ? userRsvps[0].id : null,
                event: id,
                user: user.id,
              };

              let status = userRsvps[0] ? userRsvps[0].status : null;

              return (
                <div>
                  <h3>RSVP?</h3>
                  <button
                    disabled={status === 'yes' || eventRsvps.length >= event.maxRsvps}
                    style={{ color: status === 'yes' ? 'blue' : 'black' }}
                    onClick={() => updateRsvp({ variables: { ...variables, status: 'yes' } })}
                  >
                    Yes
                  </button>
                  <button
                    disabled={status === 'no'}
                    style={{ color: status === 'no' ? 'blue' : 'black' }}
                    onClick={() => updateRsvp({ variables: { ...variables, status: 'no' } })}
                  >
                    No
                  </button>
                  {eventRsvps.length >= event.maxRsvps ? (
                    <p>You can no longer rsvp to this event</p>
                  ) : null}
                  {mutationError ? <p style={{ color: 'red' }}>Error rsvping to event</p> : null}
                </div>
              );
            }}
          </Mutation>
        );
      }}
    </Query>
  );
};

export default Rsvp;
