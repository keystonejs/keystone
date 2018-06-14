import set from 'lodash/set';

// When there are errors, we want to see if they're Access Denied.
// If so, we modify the dataset (which otherwise would be `null`) to have an
// Error object, which we'll use later in the UI code.
export const deconstructErrorsToDataShape = (error) => {
  const data = {};

  if (error && error.graphQLErrors && error.graphQLErrors.length) {
    error.graphQLErrors
    // Comes from the backend. Specific to Keystone, so shouldn't
    // give false positives with regular GraphQL errors
      .filter(gqlError => gqlError.name && gqlError.name === 'AccessDeniedError')
      .forEach(gqlError => {
        // Set the gqlError message to the path as reported by the graphql
        // gqlError
        const gqlErrorObj = new Error(`${gqlError.message} (${gqlError.uid})`);
        gqlErrorObj.name = gqlError.name;
        set(data, gqlError.path, gqlErrorObj);
      });
  }

  return data;
};
