import { AuthGqlNames } from '../types';

export const signinTemplate = ({ gqlNames }: { gqlNames: AuthGqlNames }) => {
  // -- TEMPLATE START
  return `
import React from 'react';
import { gql } from '@keystone-next/admin-ui/apollo';
import { SigninPage } from '@keystone-next/auth/pages/SigninPage'

export default function Signin() {
  return <SigninPage mutation={gql\`
  mutation($identity: String!, $secret: String!) {
    ${gqlNames.authenticateItemWithPassword}(email: $identity, password: $secret) {
      ... on UserAuthenticationWithPasswordSuccess {
        item {
          id
        }  
      }
    }
  }
  \`} />
}
  `;
  // -- TEMPLATE END
};
