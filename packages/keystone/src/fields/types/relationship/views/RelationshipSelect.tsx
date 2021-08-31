/** @jsxRuntime classic */
/** @jsx jsx */

import 'intersection-observer';
import { RefObject, useEffect, useMemo, useState, createContext, useContext } from 'react';

import { jsx } from '@keystone-ui/core';
import { MultiSelect, Select, selectComponents } from '@keystone-ui/fields';
import { validate as validateUUID } from 'uuid';
import { IdFieldConfig, ListMeta } from '../../../../types';
import { gql, TypedDocumentNode, useQuery } from '../../../../admin-ui/apollo';

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

const idValidators = {
  uuid: validateUUID,
  cuid(value: string) {
    return value.startsWith('c');
  },
  autoincrement(value: string) {
    return /^\d+$/.test(value);
  },
};

function useFilter(search: string, list: ListMeta) {
  return useMemo(() => {
    let conditions: Record<string, any>[] = [];
    if (search.length) {
      const idFieldKind: IdFieldConfig['kind'] = (list.fields.id.controller as any).idFieldKind;
      const trimmedSearch = search.trim();
      const isValidId = idValidators[idFieldKind](trimmedSearch);
      if (isValidId) {
        conditions.push({ id: trimmedSearch });
      }
      for (const field of Object.values(list.fields)) {
        if (field.search !== null) {
          conditions.push({
            [`${field.path}_contains${field.search === 'insensitive' ? '_i' : ''}`]: trimmedSearch,
          });
        }
      }
    }
    return { OR: conditions };
  }, [search, list]);
}

const initialItemsToLoad = 10;
const subsequentItemsToLoad = 50;

const idField = '____id____';

const labelField = '____label____';

const LoadingIndicatorContext = createContext<{
  count: number;
  ref: (element: HTMLElement | null) => void;
}>({
  count: 0,
  ref: () => {},
});

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
  // note it's important that this is in state rather than a ref
  // because we want a re-render if the element changes
  // so that we can register the intersection observer
  // on the right element
  const [loadingIndicatorElement, setLoadingIndicatorElement] = useState<null | HTMLElement>(null);

  const QUERY: TypedDocumentNode<
    { items: { [idField]: string; [labelField]: string | null }[]; count: number },
    { where: Record<string, any>; take: number; skip: number }
  > = gql`
    query RelationshipSelect($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!) {
      items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip) {
        ${idField}: id
        ${labelField}: ${list.labelField}
        ${extraSelection}
      }
      count: ${list.gqlNames.listQueryCountName}(where: $where)
    }
  `;

  const where = useFilter(search, list);

  const { data, error, loading, fetchMore } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: { where, take: initialItemsToLoad, skip: 0 },
  });

  const count = data?.count || 0;

  const options =
    data?.items?.map(({ [idField]: value, [labelField]: label, ...data }) => ({
      value,
      label: label || value,
      data,
    })) || [];

  const loadingIndicatorContextVal = useMemo(
    () => ({
      count,
      ref: setLoadingIndicatorElement,
    }),
    [count]
  );

  useIntersectionObserver(
    ([{ isIntersecting }]) => {
      if (!loading && isIntersecting && options.length < count) {
        const QUERY: TypedDocumentNode<
          { items: { [idField]: string; [labelField]: string | null }[] },
          { where: Record<string, any>; take: number; skip: number }
        > = gql`
              query RelationshipSelectMore($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!) {
                items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip) {
                  ${labelField}: ${list.labelField}
                  ${idField}: id
                  ${extraSelection}
                }
              }
            `;
        fetchMore({
          query: QUERY,
          variables: {
            where,
            take: subsequentItemsToLoad,
            skip: data!.items.length,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              ...prev,
              items: [...prev.items, ...fetchMoreResult.items],
            };
          },
        });
      }
    },
    { current: loadingIndicatorElement }
  );

  // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)
  if (error) {
    return <span>Error</span>;
  }

  if (state.kind === 'one') {
    return (
      <LoadingIndicatorContext.Provider value={loadingIndicatorContextVal}>
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
      </LoadingIndicatorContext.Provider>
    );
  }

  return (
    <LoadingIndicatorContext.Provider value={loadingIndicatorContextVal}>
      <MultiSelect // this is necessary because react-select passes a second argument to onInputChange
        // and useState setters log a warning if a second argument is passed
        onInputChange={val => setSearch(val)}
        isLoading={loading || isLoading}
        autoFocus={autoFocus}
        components={relationshipSelectComponents}
        portalMenu
        value={state.value.map(value => ({
          value: value.id,
          label: value.label,
          data: value.data,
        }))}
        options={options}
        onChange={value => {
          state.onChange(value.map(x => ({ id: x.value, label: x.label, data: (x as any).data })));
        }}
        placeholder={placeholder}
        controlShouldRenderValue={controlShouldRenderValue}
        isClearable={controlShouldRenderValue}
        isDisabled={isDisabled}
      />
    </LoadingIndicatorContext.Provider>
  );
};

const relationshipSelectComponents: Partial<typeof selectComponents> = {
  MenuList: ({ children, ...props }) => {
    const { count, ref } = useContext(LoadingIndicatorContext);
    return (
      <selectComponents.MenuList {...props}>
        {children}
        <div css={{ textAlign: 'center' }} ref={ref}>
          {props.options.length < count && <span css={{ padding: 8 }}>Loading...</span>}
        </div>
      </selectComponents.MenuList>
    );
  },
};
