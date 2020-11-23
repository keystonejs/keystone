/** @jsx jsx */

import 'intersection-observer';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { gql, TypedDocumentNode, useQuery } from '@keystone-next/admin-ui/apollo';
import { ListMeta } from '@keystone-next/types';
import { jsx } from '@keystone-ui/core';
import { MultiSelect, Select, selectComponents } from '@keystone-ui/fields';

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

const idField = '____id____';

const labelField = '____label____';

export const RelationshipSelect = ({
  autoFocus,
  controlShouldRenderValue,
  isDisabled,
  isLoading,
  list,
  placeholder,
  state,
  extraSelection = '',
}: {
  autoFocus?: boolean;
  controlShouldRenderValue: boolean;
  isDisabled: boolean;
  isLoading?: boolean;
  list: ListMeta;
  placeholder?: string;
  state:
    | {
        kind: 'many';
        value: { label: string; id: string; data?: Record<string, any> }[];
        onChange(value: { label: string; id: string; data: Record<string, any> }[]): void;
      }
    | {
        kind: 'one';
        value: { label: string; id: string; data?: Record<string, any> } | null;
        onChange(value: { label: string; id: string; data: Record<string, any> } | null): void;
      };
  extraSelection?: string;
}) => {
  const [search, setSearch] = useState('');

  const QUERY: TypedDocumentNode<
    { items: { [idField]: string; [labelField]: string | null }[]; meta: { count: number } },
    { search: string; first: number; skip: number }
  > = gql`
    query RelationshipSelect($search: String!, $first: Int!, $skip: Int!) {
      items: ${list.gqlNames.listQueryName}(search: $search, first: $first, skip: $skip) {
        ${idField}: id
        ${labelField}: ${list.labelField}
        ${extraSelection}
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
          { items: { [idField]: string; [labelField]: string | null }[] },
          { search: string; first: number; skip: number }
        > = gql`
            query RelationshipSelectMore($search: String!, $first: Int!, $skip: Int!) {
              items: ${list.gqlNames.listQueryName}(search: $search, first: $first, skip: $skip) {
                ${labelField}: ${list.labelField}
                ${idField}: id
                ${extraSelection}
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
    data?.items?.map(({ [idField]: value, [labelField]: label, ...data }) => ({
      value,
      label: label || value,
      data,
    })) || [];

  if (state.kind === 'one') {
    return (
      <Select
        // this is necessary because react-select passes a second argument to onInputChange
        // and useState setters log a warning if a second argument is passed
        onInputChange={val => setSearch(val)}
        isLoading={loading || isLoading}
        autoFocus={autoFocus}
        components={relationshipSelectComponents}
        portalMenu
        value={
          state.value
            ? {
                value: state.value.id,
                label: state.value.label,
                // @ts-ignore
                data: state.value.data,
              }
            : null
        }
        options={options}
        onChange={value => {
          state.onChange(
            value
              ? {
                  id: value.value,
                  label: value.label,
                  data: (value as any).data,
                }
              : null
          );
        }}
        placeholder={placeholder}
        controlShouldRenderValue={controlShouldRenderValue}
        isClearable={controlShouldRenderValue}
        isDisabled={isDisabled}
      />
    );
  }

  return (
    <MultiSelect // this is necessary because react-select passes a second argument to onInputChange
      // and useState setters log a warning if a second argument is passed
      onInputChange={val => setSearch(val)}
      isLoading={loading || isLoading}
      autoFocus={autoFocus}
      components={relationshipSelectComponents}
      portalMenu
      value={state.value.map(value => ({ value: value.id, label: value.label, data: value.data }))}
      options={options}
      onChange={value => {
        state.onChange(value.map(x => ({ id: x.value, label: x.label, data: (x as any).data })));
      }}
      placeholder={placeholder}
      controlShouldRenderValue={controlShouldRenderValue}
      isClearable={controlShouldRenderValue}
      isDisabled={isDisabled}
    />
  );
};
