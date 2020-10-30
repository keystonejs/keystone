import { Stack } from '@keystone-ui/core';
import { Notice } from '@keystone-ui/notice';
import { GraphQLError } from 'graphql';
import React from 'react';

type GraphQLErrorNoticeProps = {
  networkError: Error | null | undefined;
  errors: readonly GraphQLError[] | undefined;
};

export function GraphQLErrorNotice({ errors, networkError }: GraphQLErrorNoticeProps) {
  if (networkError) {
    return <Notice tone="negative">{networkError.message}</Notice>;
  }
  if (errors?.length) {
    return (
      <Stack gap="small">
        {errors.map(err => {
          const errButAny: any = err;
          if (err.name === 'ValidationFailureError' && errButAny.data?.messages?.length) {
            return errButAny.data.messages.map((message: string) => (
              <Notice tone="negative">{message}</Notice>
            ));
          }
          return <Notice tone="negative">{err.message}</Notice>;
        })}
      </Stack>
    );
  }
  return null;
}
