import gql from 'graphql-tag';
import { USER_IMAGE } from './fragments';

export const GET_ORGANISERS = gql`
  query {
    allOrganisers {
      user {
        ...UserImage
        id
        name
        twitterHandle
      }
    }
  }
  ${USER_IMAGE}
`;
