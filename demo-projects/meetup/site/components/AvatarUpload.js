/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useToasts } from 'react-toast-notifications';
import { Avatar } from './Avatar';

const validImageTypes = 'image/gif, image/jpeg, image/jpg, image/png';

export const AvatarUpload = ({ userId, size }) => {
  const [loadingImage, setLoadingImage] = useState(false);
  const [updateAvatar] = useMutation(UPDATE_AVATAR);
  const { data = {}, loading } = useQuery(USER, { variables: { userId } });
  const { addToast } = useToasts();
  if (loading) return null;

  const user = data.User;
  if (!user) return null;

  const handleImageChange = files => {
    const file = files ? files[0] : false;
    if (!file) return;

    // Validate file type
    if (!file.type || validImageTypes.indexOf(file.type) === -1) {
      addToast('Please provide a valid image type: GIF, JPG, or PNG.', {
        appearance: 'error',
        autoDismiss: true,
      });
      return null;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      addToast('Maximum image size is 5MB.', {
        appearance: 'error',
        autoDismiss: true,
      });
      return null;
    }

    setLoadingImage(true);
    updateAvatar({
      variables: {
        userId,
        image: file,
      },
    })
      .then(() => {
        setLoadingImage(false);
        addToast('New avatar image saved successfully.', {
          appearance: 'success',
          autoDismiss: true,
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  };

  return (
    <label
      css={{
        display: 'block',
        cursor: 'pointer',
        textAlign: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        ':hover div': {
          textDecoration: 'underline',
        },
      }}
    >
      {loadingImage ? (
        <p>loading...</p>
      ) : (
        <Avatar
          css={{ margin: '0 auto', border: '2px solid white' }}
          alt={user.name}
          size={size}
          src={user.image ? user.image.xxlarge : null}
        />
      )}
      <div
        css={{
          color: '#666',
          fontSize: '0.88rem',
          marginTop: '1em',
        }}
      >
        {user.image ? 'Change profile image' : 'Add profile image'}
      </div>
      <input
        accept={validImageTypes}
        type="file"
        onChange={e => handleImageChange(e.target.files)}
        css={{
          height: 0,
          opacity: 0,
          position: 'absolute',
          visibility: 'hidden',
          width: 0,
        }}
      />
    </label>
  );
};

AvatarUpload.propTypes = {
  size: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge']).isRequired,
  userId: PropTypes.string.isRequired,
};

const USER = gql`
  # Fragments
  ${Avatar.fragments.imageMedium}
  ${Avatar.fragments.imageXXLarge}

  query user($userId: ID!) {
    User(where: { id: $userId }) {
      id
      name
      image {
        ...AvatarImageMedium
        ...AvatarImageXXLarge
      }
    }
  }
`;

const UPDATE_AVATAR = gql`
  # Fragments
  ${Avatar.fragments.imageMedium}
  ${Avatar.fragments.imageXXLarge}

  mutation UpdateUser($userId: ID!, $image: Upload) {
    updateUser(id: $userId, data: { image: $image }) {
      id
      name
      image {
        ...AvatarImageMedium
        ...AvatarImageXXLarge
      }
    }
  }
`;
