/** @jsxRuntime classic */
/** @jsx jsx */
import { Button } from '@keystone-ui/button';
import { jsx } from '@keystone-ui/core';
import { ListMeta } from '../../types';
import { Link } from '../router';

export const CreateButtonLink = (props: { list: ListMeta }) => {
  return (
    <Button
      css={{
        textDecoration: 'none',
        ':hover': {
          color: 'white',
        },
      }}
      as={Link}
      href={`/${props.list.path}/create`}
      tone="active"
      size="small"
      weight="bold"
    >
      Create {props.list.singular}
    </Button>
  );
};
