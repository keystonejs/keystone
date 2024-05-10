import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo';
import { DeepNullable, makeDataGetter } from '@keystone-6/core/admin-ui/utils';
import { useMemo } from 'react';

// Custom hook to fetch and provide the foreign list key for a field
export default function useFieldForeignListKey(listKey: string, fieldPath: string): {
  foreignListKey: string; // The foreign list key obtained from the server
  foreignLabelPath: string;
  refetch: () => Promise<void>; // Function to refetch the query data
} {
  // GraphQL query to get the foreign list key based on the provided listKey and fieldPath
  const result = useQuery(
    gql`
      query FieldForeignListKey($listKey: String!, $fieldPath: String!) {
        FieldForeignListKey(listKey: $listKey, fieldPath: $fieldPath) {
          foreignListKey
          foreignLabelPath
        }
      }
    `,
    { variables: { listKey, fieldPath } } // Pass query variables
  );

  // Use useMemo to efficiently compute derived state based on the query result
  return useMemo(() => {
    // Function to refetch the query data
    const refetch = async () => {
      await result.refetch(); // Calls the refetch method on the result object
    };

    // Create a data getter object to safely access deeply nested GraphQL data
    const dataGetter = makeDataGetter<DeepNullable<{ FieldForeignListKey: { foreignListKey: string; foreignLabelPath: string; } }>>(
      result.data,
      result.error?.graphQLErrors // Pass GraphQL errors if present
    );

    // Extract and return the foreign list key from the data or an empty string if unavailable
    return {
      foreignListKey: dataGetter.get('FieldForeignListKey').get('foreignListKey').data || '',
      foreignLabelPath: dataGetter.get('FieldForeignListKey').get('foreignLabelPath').data || '',
      refetch, // Include the refetch function in the return object
    };
  }, [result]); // Dependencies include the result object to recompute the memoized value
}
