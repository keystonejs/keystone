/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { gql, TypedDocumentNode, useQuery } from '@keystone-next/admin-ui/apollo';
import { Select, selectComponents, MultiSelect } from '@keystone-ui/fields';
import 'intersection-observer';
import { useState, useMemo, useRef, useEffect, RefObject } from 'react';
import { ListMeta } from '@keystone-next/types';

function useIntersectionObserver(cb: IntersectionObserverCallback, ref: RefObject<any>) {
  useEffect(() => {
    let observer = new IntersectionObserver(cb, {});
    let node = ref.current;
    if (node !== null) {
      observer.observe(node);
      return () => observer.unobserve(node);
    }
  });
}

const initialItemsToLoad = 10;
const subsequentItemsToLoad = 50;

export const RelationshipSelect = ({
  autoFocus,
  list,
  isDisabled,
  state,
}: {
  list: ListMeta;
  autoFocus?: boolean;
  isDisabled: boolean;
  state:
    | {
        kind: 'many';
        value: { label: string; id: string }[];
        onChange(value: { label: string; id: string }[]): void;
      }
    | {
        kind: 'one';
        value: { label: string; id: string } | null;
        onChange(value: { label: string; id: string } | null): void;
      };
}) => {
  const [search, setSearch] = useState('');

  const QUERY: TypedDocumentNode<
    { items: { id: string; label: string | null }[]; meta: { count: number } },
    { search: string; first: number; skip: number }
  > = gql`
    query RelationshipSelect($search: String!, $first: Int!, $skip: Int!) {
      items: ${list.gqlNames.listQueryName}(search: $search, first: $first, skip: $skip) {
        id
        label: ${list.labelField}
      }

      meta: ${list.gqlNames.listQueryMetaName}(search: $search) {
        count
      }
    }
  `;

  const { data, error, loading, fetchMore } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: { search, first: initialItemsToLoad, skip: 0 },
  });

  const count = data?.meta.count || 0;

  const relationshipSelectComponents: Partial<typeof selectComponents> = useMemo(
    () => ({
      MenuList: ({ children, ...props }) => {
        const loadingRef = useRef(null);
        const QUERY: TypedDocumentNode<
          { items: { id: string; label: string | null }[] },
          { search: string; first: number; skip: number }
        > = gql`
            query RelationshipSelectMore($search: String!, $first: Int!, $skip: Int!) {
              items: ${list.gqlNames.listQueryName}(search: $search, first: $first, skip: $skip) {
                label: ${list.labelField}
                id
              }
            }
          `;

        useIntersectionObserver(([{ isIntersecting }]) => {
          if (!props.selectProps.isLoading && isIntersecting && props.options.length < count) {
            fetchMore({
              query: QUERY,
              variables: {
                search,
                first: subsequentItemsToLoad,
                skip: props.options.length,
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prev;
                return {
                  meta: prev.meta,
                  items: [...prev.items, ...fetchMoreResult.items],
                };
              },
            });
          }
        }, loadingRef);

        return (
          <selectComponents.MenuList {...props}>
            {children}
            <div css={{ textAlign: 'center' }} ref={loadingRef}>
              {props.options.length < count && <span css={{ padding: 8 }}>Loading...</span>}
            </div>
          </selectComponents.MenuList>
        );
      },
    }),
    [count, list.gqlNames.listQueryName]
  );

  // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)
  if (error) {
    return <span>Error</span>;
  }

  const options =
    data?.items?.map((val: any) => ({
      value: val.id,
      label: val.label || val.id,
    })) || [];

  if (state.kind === 'one') {
    return (
      <Select
        // this is necessary because react-select passes a second argument to onInputChange
        // and useState setters log a warning if a second argument is passed
        onInputChange={val => setSearch(val)}
        isLoading={loading}
        autoFocus={autoFocus}
        components={relationshipSelectComponents}
        value={state.value ? { value: state.value.id, label: state.value.label } : null}
        options={options}
        onChange={value => {
          state.onChange(
            value
              ? {
                  id: value.value,
                  label: value.label,
                }
              : null
          );
        }}
        isClearable
        isDisabled={isDisabled}
      />
    );
  }

  return (
    <MultiSelect // this is necessary because react-select passes a second argument to onInputChange
      // and useState setters log a warning if a second argument is passed
      onInputChange={val => setSearch(val)}
      isLoading={loading}
      autoFocus={autoFocus}
      components={relationshipSelectComponents}
      value={state.value.map(value => ({ value: value.id, label: value.label })) || null}
      options={options}
      onChange={value => {
        state.onChange(value.map(x => ({ id: x.value, label: x.label })));
      }}
      isClearable
      isDisabled={isDisabled}
    />
  );
};
