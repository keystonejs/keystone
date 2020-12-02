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
           identityField="${identityField}"
           secretField="${secretField}"
           mutationName="${gqlNames.authenticateItemWithPassword}"
           successTypename="${gqlNames.ItemAuthenticationWithPasswordSuccess}"
           failureTypename="${gqlNames.ItemAuthenticationWithPasswordFailure}"
         />
}
  `;
  // -- TEMPLATE END
};
