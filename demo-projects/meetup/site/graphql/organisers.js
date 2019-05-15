import gql from 'graphql-tag';
import { UserImage } from './fragments';

export const GET_ORGANISERS = gql`
  ${UserImage}
  query {
    allOrganisers{
      user {
        ...UserImage
        id
        name
        twitterHandle
      }
    }
  }
`;
