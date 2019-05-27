/** @jsx jsx */
import { Mutation, Query } from 'react-apollo';
import { jsx } from '@emotion/core';

import { Button as ButtonPrimitive, CheckmarkIcon } from '../primitives';
import { useAuth } from '../lib/authetication';
import { GET_RSVPS, UPDATE_RSVP, ADD_RSVP } from '../graphql/rsvps';

function validateRsvp({ loading, userRsvps, eventRsvps, event }) {
  if (loading) {
    return { okay: false, message: 'RSVP is loading data...' };
  }

  if (new Date() > new Date(event.startTime)) {
    return { okay: false, message: 'This event is in the past.' };
  }

  if (!event || !event.isRsvpAvailable) {
    return { okay: false, message: 'RSVP is not available.' };
  }

  if (event.maxRsvps !== null && eventRsvps.length >= event.maxRsvps && !userRsvps.length) {
    return { okay: false, message: 'Max attendees reached.' };
  }

  return { okay: true };
}

const Rsvp = ({ children, event, text, themeColor }) => {
  const { isAuthenticated, user } = useAuth();
  const eventId = event.id;
  const isPast = new Date() > new Date(event.startTime);

  if (!isAuthenticated) {
    return isPast
      ? null
      : children({
          component: (
            <ButtonWrapper>
              <span css={{ marginRight: '0.5em', flex: 1 }}>{text}</span>
              <Button route="/signin">Sign In</Button>
            </ButtonWrapper>
          ),
        });
  }

  return (
    <Query query={GET_RSVPS} variables={{ event: eventId, user: user.id }}>
      {({ data, loading, error }) => {
        if (error) {
          console.error(error);
          return null;
        }

        const { userRsvps, eventRsvps, event } = data;
        const userResponse = userRsvps && userRsvps[0];
        const hasResponded = Boolean(userResponse);
        const { okay, message } = validateRsvp({ loading, userRsvps, eventRsvps, event });

        if (!okay) {
          return children({ message });
        }

        const refetch = () => [
          {
            query: GET_RSVPS,
            variables: { event: eventId, user: user.id },
          },
        ];

        return (
          <Mutation mutation={hasResponded ? UPDATE_RSVP : ADD_RSVP} refetchQueries={refetch}>
            {(updateRsvp, { error: mutationError }) => {
              if (mutationError) {
                console.error(mutationError);
                return children({ message: mutationError.message });
              }

              const doRespond = status =>
                updateRsvp({
                  variables: {
                    rsvp: hasResponded ? userResponse.id : null,
                    event: eventId,
                    user: user.id,
                    status,
                  },
                });
              const respondYes = () => doRespond('yes');
              const respondNo = () => doRespond('no');

              const isGoing = hasResponded ? userResponse.status === 'yes' : false;

              return children({
                component: (
                  <ButtonWrapper>
                    <span css={{ marginRight: '0.5em', flex: 1 }}>{text}</span>
                    <Button
                      disabled={loading || isGoing}
                      isSelected={hasResponded && isGoing}
                      background={themeColor}
                      onClick={respondYes}
                    >
                      Yes
                    </Button>
                    <Button
                      disabled={loading || !isGoing}
                      isSelected={hasResponded && !isGoing}
                      background={themeColor}
                      onClick={respondNo}
                    >
                      No
                    </Button>
                  </ButtonWrapper>
                ),
              });
            }}
          </Mutation>
        );
      }}
    </Query>
  );
};

Rsvp.defaultProps = {
  children: () => null,
  text: 'Are you going?',
};

const ButtonWrapper = props => (
  <div
    css={{
      alignItems: 'center',
      display: 'flex',
      flex: 1,
      minHeight: 40, // NOTE: stop jumping around when no buttons
    }}
    {...props}
  />
);

const Button = ({ background, children, isSelected, ...props }) => (
  <ButtonPrimitive
    css={{
      boxSizing: 'border-box',
      marginLeft: '0.25em',
      minWidth: 92,
    }}
    background={isSelected ? background : null}
    outline={!isSelected}
    size="small"
    {...props}
  >
    {isSelected ? <CheckmarkIcon size={16} stroke={3} css={{ marginRight: '0.25rem' }} /> : null}
    {children}
  </ButtonPrimitive>
);

export default Rsvp;
