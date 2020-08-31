import { gql } from '@apollo/client';
import { USER_IMAGE } from './fragments';

export const GET_ORGANISERS = gql`
  query {
    allOrganisers(where: { user_is_null: false }) {
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
