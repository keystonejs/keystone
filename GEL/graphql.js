import gql from 'graphql-tag';

export const ALL_COMPONENTS = {
	query: gql`
		{
			allComponents {
				name
				packageName
				version
				description
				author
			}
		}
	`,
	fetchPolicy: 'network-only',
};
