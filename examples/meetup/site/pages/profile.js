import React, { useState, useCallback } from 'react';
import { useFormState } from 'react-use-form-state';
import { useToasts } from 'react-toast-notifications';
import { gql, useMutation } from '@apollo/client';

import { AvatarUpload } from '../components/AvatarUpload';
import Meta from '../components/Meta';

const ProfilePage = props => {
  const { error, user } = props;

  return error ? (
    <h1>Error loading User Profile.</h1>
  ) : (
    <>
      <Meta title={user.name} />
      <Profile {...props} />
    </>
  );
};

ProfilePage.getInitialProps = async ctx => {
  try {
    const { data, error } = await ctx.apolloClient.query({
      query: USER,
    });
    // Redirect to the Signin page when the user is not logged in or if there is an error.
    if (!data.authenticatedUser || error) {
      ctx.res.redirect('/signin');
    }

    return {
      user: data.authenticatedUser,
      error: error,
    };
  } catch (error) {
    // If there was an error, we need to pass it down so the page can handle it.
    return { error };
  }
};

export default ProfilePage;

const Profile = ({ user }) => {
  const [formState, { text, email, password }] = useFormState({
    name: user.name,
    email: user.email,
    twitterHandle: user.twitterHandle || '',
    image: user.image,
  });
  const { addToast } = useToasts();
  const [validationErrors, setValidationErrors] = useState({});
  const [updatingUser, setUpdatingUser] = useState(false);

  const [updateUser] = useMutation(UPDATE_USER);

  const submitDisabled =
    updatingUser ||
    (formState.touched.email && !formState.validity.email) ||
    (formState.touched.password && !formState.validity.password) ||
    !formState.values.password ||
    !formState.values.confirmPassword;

  const handleSubmit = useCallback(
    async event => {
      event.preventDefault();
      if (formState.values.password !== formState.values.confirmPassword) {
        setValidationErrors({ password: 'Your password should match.' });
        return null;
      }
      setUpdatingUser(true);

      try {
        await updateUser({
          variables: {
            ...formState,
          },
        });
        addToast('Changes saved successfully.', {
          appearance: 'success',
          autoDismiss: true,
        });
      } catch (error) {
        const errorMessage = error.message.replace(
          'GraphQL error: [password:minLength:User:password] ',
          ''
        );
        setValidationErrors({ password: `${errorMessage}` });

        addToast('Please try again.', {
          appearance: 'error',
          autoDismiss: true,
        });
      }

      setUpdatingUser(false);
    },
    [formState]
  );

  return (
    <div>
      <AvatarUpload userId={user.id} size="xlarge" />
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">
          Name
          <input {...text('name')} autoComplete="name" disabled={updatingUser} />
        </label>
        <br />
        <label htmlFor="email">
          Email
          <input required {...email('email')} autoComplete="email" disabled={updatingUser} />
          {!formState.validity.email && <span>Please enter a valid email address.</span>}
        </label>
        <br />
        <label htmlFor="twitterHandle">
          Twitter
          <input {...text('twitterHandle')} disabled={updatingUser} />
        </label>
        <br />
        <label htmlFor="password">
          New Password
          <input
            required
            minLength="8"
            autoComplete="new-password"
            disabled={updatingUser}
            {...password('password')}
            onFocus={() => setValidationErrors({ password: '' })}
          />
          <br />
          {formState.touched.password && !formState.validity.password && (
            <span>Your password must be at least 8 characters long.</span>
          )}
          {validationErrors && validationErrors.password && (
            <span>{validationErrors.password}</span>
          )}
        </label>
        <br />
        <label htmlFor="confirmPassword">
          Confirm Password
          <input
            autoComplete="new-password"
            disabled={updatingUser}
            {...password('confirmPassword')}
            onFocus={() => setValidationErrors({ password: '' })}
          />
        </label>
        <br />
        <button disabled={submitDisabled} type="submit">
          {updatingUser ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const USER = gql`
  query user {
    authenticatedUser {
      id
      name
      email
      twitterHandle
      image {
        publicUrlTransformed(
          transformation: { quality: "40", width: "90", height: "90", crop: "thumb", page: "1" }
        )
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $userId: ID!
    $name: String
    $email: String
    $twitterHandle: String
    $password: String
  ) {
    updateUser(
      id: $userId
      data: { name: $name, email: $email, twitterHandle: $twitterHandle, password: $password }
    ) {
      id
      name
      email
      twitterHandle
    }
  }
`;
