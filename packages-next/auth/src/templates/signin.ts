import { AuthGqlNames } from '../types';

export const signinTemplate = ({
  gqlNames,
  identityField,
  secretField,
}: {
  gqlNames: AuthGqlNames;
  identityField: string;
  secretField: string;
}) => {
  // -- TEMPLATE START
  return `
import React from 'react';
import { gql } from '@keystone-next/admin-ui/apollo';
import { SigninPage } from '@keystone-next/auth/pages/SigninPage'

export default function Signin() {
  return <SigninPage
           identityField=${JSON.stringify(identityField)}
           secretField=${JSON.stringify(secretField)}
           mutationName=${JSON.stringify(gqlNames.authenticateItemWithPassword)}
           successTypename=${JSON.stringify(gqlNames.ItemAuthenticationWithPasswordSuccess)}
           failureTypename=${JSON.stringify(gqlNames.ItemAuthenticationWithPasswordFailure)}
         />
}
  `;
  // -- TEMPLATE END
};
