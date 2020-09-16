import { gql } from '@apollo/client';
import { USER_IMAGE } from './fragments';

export const ADD_RSVP = gql`
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

export const UPDATE_RSVP = gql`
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

export const GET_EVENT_RSVPS = gql`
  query GetEventRsvps($event: ID!) {
    allRsvps(where: { event: { id: $event }, status: yes, user_is_null: false }) {
      id
      status
      user {
        id
        name
        ...UserImage
      }
    }
  }
  ${USER_IMAGE}
`;

export const GET_RSVPS = gql`
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
      isRsvpAvailable
    }
  }
`;
