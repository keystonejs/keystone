
import React from 'react';
import { EyeIcon } from '@arch-ui/icons';
import { IconButton } from '@arch-ui/button';
import { useMutation } from 'react-apollo-hooks';


export default ({ list, selectedItems, onUpdateMany }) => {
  const publishVariable = selectedItems.map(id => ({ id, data: { status: 'published' } }));
  const unPublishVariable = selectedItems.map(id => ({ id, data: { status: 'draft' } }));
  const updatePosts = useMutation(list.updateManyMutation, { update: () => {
    onUpdateMany();
  } });

  return (
    <>
      <IconButton
        appearance="default"
        variant="nuance"
        icon={EyeIcon}
        onClick={() => updatePosts({ variables: { data: publishVariable } })}
      >
        Publish Posts
      </IconButton>
      <IconButton
        appearance="danger"
        variant="nuance"
        icon={EyeIcon}
        onClick={() => updatePosts({ variables: { data: unPublishVariable } })}
      >
        Un-Publish
      </IconButton>
    </>
  );
};
