import { gql, useQuery } from '@keystone-6/core/admin-ui/apollo'
import { DeepNullable, makeDataGetter } from '@keystone-6/core/admin-ui/utils';
import { useMemo } from 'react';

export default function useFieldProps(listKey: string, fieldPath: string): {
  props: unknown;
  refetch: () => Promise<void>;
} {
  const result = useQuery(
    gql`query FieldProps($listKey: String!, $fieldPath: String!) {
      FieldProps(listKey: $listKey, fieldPath: $fieldPath) {
        props
      }
    }`,
    { variables: { listKey, fieldPath } }
  )
  return useMemo(() => {
    const refetch = async () => {
      await result.refetch()
    }
    const dataGetter = makeDataGetter<DeepNullable<{ FieldProps: { props: unknown } }>>(result.data, result.error?.graphQLErrors)
    return {
      props: dataGetter.get('FieldProps').get("props").data,
      refetch,
    }
  }, [result])
}