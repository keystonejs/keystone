/** @jsx jsx */
import { useQuery, useMutation } from '@apollo/react-hooks';
import { jsx } from '@emotion/core';

import { Button as ButtonPrimitive, CheckmarkIcon, Loading } from '../primitives';
import { useAuth } from '../lib/authetication';
import { GET_RSVPS, UPDATE_RSVP, ADD_RSVP } from '../graphql/rsvps';
import AuthModal from './auth/modal';

function validateRsvp({ userRsvps, eventRsvps, event }) {
  if (!event || !event.isRsvpAvailable) {
    return { okay: false, message: null }; // RSVP is not available
  }

  if (new Date() > new Date(event.startTime)) {
    return { okay: false, message: null }; // This event is in the past.
  }

  if (event.maxRsvps !== null && eventRsvps.length >= event.maxRsvps && !userRsvps.length) {
    return { okay: false, message: 'Max attendees reached.' };
  }

  return { okay: true };
}

const Rsvp = ({ children, event, text, themeColor }) => {
  const eventId = event.id;
  const isPast = new Date() > new Date(event.startTime);
  const { isAuthenticated, isLoading, user } = useAuth();
  const userId = user ? user.id : null;
  const { data, loading: loadingData, error } = useQuery(GET_RSVPS, {
    variables: { event: eventId, user: userId },
    skip: !userId,
  });
  const { userRsvps, eventRsvps, event: rsvpEvent } = data || {};
  const userResponse = userRsvps && userRsvps[0];
  const hasResponded = Boolean(userResponse);
  const refetch = () => [
    {
      query: GET_RSVPS,
      variables: { event: eventId, user: userId },
    },
  ];
  const [updateRsvp, { error: mutationError, loading: mutationLoading }] = useMutation(
    hasResponded ? UPDATE_RSVP : ADD_RSVP,
    {
      refetchQueries: refetch,
    }
  );

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return isPast
      ? null
      : children({
          component: (
            <AuthModal mode="signin">
              {({ openModal }) => (
                <ButtonWrapper>
                  <span css={{ marginRight: '0.5em', flex: 1 }}>{text}</span>
                  <Button href="/signin" onClick={openModal}>
                    Sign In
                  </Button>
                </ButtonWrapper>
              )}
            </AuthModal>
          ),
        });
  }

  if (error) {
    console.error(error);
    return null;
  }

  if (loadingData) {
    return children({
      component: (
        <ButtonWrapper>
          <span css={{ marginRight: '0.5em', flex: 1 }}>{text}</span>
          <Loading size="xsmall" color={themeColor} />
        </ButtonWrapper>
      ),
    });
  }

  const { okay, message } = validateRsvp({ userRsvps, eventRsvps, event: rsvpEvent });

  if (!okay) {
    return children({ message });
  }

  if (mutationError) {
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
          disabled={mutationLoading || isGoing}
          isSelected={hasResponded && isGoing}
          background={themeColor}
          onClick={respondYes}
        >
          Yes
        </Button>
        <Button
          disabled={mutationLoading || !isGoing}
          isSelected={hasResponded && !isGoing}
          background={themeColor}
          onClick={respondNo}
        >
          No
        </Button>
      </ButtonWrapper>
    ),
  });
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
