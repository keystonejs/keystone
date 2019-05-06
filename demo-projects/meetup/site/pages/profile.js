import React, { useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { useFormState } from 'react-use-form-state';
import { withToastManager } from 'react-toast-notifications';
// import { AvatarUpload } from '../components/ecosystem/AvatarUpload';

const Profile = withToastManager(props => {
	const { toastManager } = props;

	const [validationErrors, setValidationErrors] = useState({});
	const [updatingUser, setUpdatingUser] = useState(false);

	return (
		<Query
			query={gql`
				{
					allUsers{
						id
						name
						email
						image {
							publicUrlTransformed(transformation: {
								quality: "40"
								width: "90"
								height: "90"
								crop: "thumb"
								page: "1"
							})
						}
					}
				}
			`}
		>
			{({ data, loading, error }) => {

				const [formState, { text, email, password }] = useFormState({
					name: data.user.name,
					email: data.user.email,
					image:data.user.image.publicUrlTransformed,
				});
				const handleSubmit = useCallback(
					async event => {
						event.preventDefault();
						if (formState.values.password !== formState.values.confirmPassword) {
							setValidationErrors({ password: 'Your password should match.' });
							return null;
						}
						setUpdatingUser(true);

						try {
							// await updateUser({
							// 	variables: {
							// 		...informationToUpdate,
							// 	},
							// });

							toastManager.add('Changes saved successfully.', {
								appearance: 'success',
								autoDismiss: true,
							});
						} catch (error) {
							const errorMessage = error.message.replace(
								'GraphQL error: [password:minLength:User:password] ',
								''
							);
							setValidationErrors({ password: `${errorMessage}` });

							toastManager.add('Please try again.', {
								appearance: 'error',
								autoDismiss: true,
							});
						}

						setUpdatingUser(false);
					},
					[formState]
				);

				// Derived state from props
				const submitDisabled =
					updatingUser ||
					(formState.touched.email === true && formState.validity.email === false) ||
					(formState.touched.password === true && formState.validity.password === false) ||
					(!formState.values.password || !formState.values.confirmPassword);

				if (loading) return <p>Loading...</p>;
				if (error) {
					console.log(error);
					return <p>Error!</p>;
				}
				console.log(formState);
				return (
					<form onSubmit={handleSubmit} noValidate>
						<label htmlFor="name">Name
							<input
								{...text('name')}
								autoComplete="name"
								disabled={updatingUser}
							/>
						</label>
						<label htmlFor="email">Email
							<input
								required
								{...email('email')}
								autoComplete="email"
								disabled={updatingUser}
							/>
							{formState.validity.email === false && (
								<span>Please enter a valid email address.</span>
							)}
						</label>
						<label htmlFor="password">New Password
							<input
								required
								minLength="8"
								autoComplete="new-password"
								disabled={updatingUser}
								{...password('password')}
								onFocus={() => setValidationErrors({ password: '' })}
							/>
							{formState.touched.password === true &&
								formState.validity.password === false && (
									<span>
										Your password must be at least 2 characters long.
									</span>
								)}
							{validationErrors && validationErrors.password && (
								<span>{validationErrors.password}</span>
							)}
						</label>
						<label htmlFor="confirmPassword">Confirm Password
							<input
								autoComplete="new-password"
								disabled={updatingUser}
								{...password('confirmPassword')}
								onFocus={() => setValidationErrors({ password: '' })}
							/>
						</label>
						<button disabled={submitDisabled} type="submit">
							{updatingUser ? 'Saving...' : 'Save Changes'}
						</button>
					</form>
				);
			}}
		</Query>
	);
});

export default Profile;
