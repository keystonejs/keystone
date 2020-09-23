/* @jsx jsx */

import { jsx } from '@emotion/core';
import { Button } from '@keystone-ui/button';
import { FunctionComponent, useEffect } from 'react';

import { useMutation, gql } from '../apollo';

const END_SESSION = gql`
  mutation EndSession {
    endSession
  }
`;

const SignoutButton: FunctionComponent = ({ children, ...props }) => {
  const [endSession, { loading, data }] = useMutation(END_SESSION);
  useEffect(() => {
    if (data?.endSession) {
      window.location.reload();
    }
  }, [data]);

  return (
    <Button size="small" isLoading={loading} onPress={() => endSession()} {...props}>
      {children || 'sign out'}
    </Button>
  );
};
export { SignoutButton };
