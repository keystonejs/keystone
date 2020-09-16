/** @jsx jsx */
import { jsx } from '@emotion/core';
import { gql, useQuery } from '@apollo/client';
import Select from '@arch-ui/select';
import { components } from 'react-select';
import 'intersection-observer';
import { useState, useMemo, useRef, useEffect, forwardRef } from 'react';

function useIntersectionObserver(cb, ref) {
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

// to use hooks in render props
const Relationship = forwardRef(
  (
    {
      data,
      loading,
      value,
      refList,
      canRead,
      isMulti,
      search,
      autoFocus,
      serverErrors,
      onChange,
      htmlID,
      setSearch,
      selectProps,
      fetchMore,
      isDisabled,
    },
    ref
  ) => {
    const options =
      data && data[refList.gqlNames.listQueryName]
        ? data[refList.gqlNames.listQueryName].map(val => ({
            value: val,
            label: val._label_,
          }))
        : [];
    const serverError =
      serverErrors &&
      serverErrors.find(error => error instanceof Error && error.name === 'AccessDeniedError');
    let currentValue = null;

    const getOption = value =>
      typeof value === 'string'
        ? options.find(opt => opt.value.id === value) || { label: value, value: value }
        : { label: value._label_, value: value };

    if (value !== null && canRead) {
      if (isMulti) {
        currentValue = (Array.isArray(value) ? value : []).map(getOption);
      } else if (value) {
        currentValue = getOption(value);
      }
    }

    const count =
      data && data[refList.gqlNames.listQueryMetaName]
        ? data[refList.gqlNames.listQueryMetaName].count
        : 0;

    const selectComponents = useMemo(
      () => ({
        MenuList: ({ children, ...props }) => {
          const loadingRef = useRef(null);
          const QUERY = gql`
            query RelationshipSelectMore($search: String!, $first: Int!, $skip: Int!) {
              ${refList.gqlNames.listQueryName}(search: $search, first: $first, skip: $skip) {
                _label_
                id
              }
            }
          `;

          useIntersectionObserver(([{ isIntersecting }]) => {
            if (!props.isLoading && isIntersecting && props.options.length < count) {
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
                    ...prev,
                    [refList.gqlNames.listQueryName]: [
                      ...prev[refList.gqlNames.listQueryName],
                      ...fetchMoreResult[refList.gqlNames.listQueryName],
                    ],
                  };
                },
              });
            }
          }, loadingRef);

          return (
            <components.MenuList {...props}>
              {children}
              <div css={{ textAlign: 'center' }} ref={loadingRef}>
                {props.options.length < count && <span css={{ padding: 8 }}>Loading...</span>}
              </div>
            </components.MenuList>
          );
        },
      }),
      [count, refList.gqlNames.listQueryName]
    );
    return (
      <Select
        // this is necessary because react-select passes a second argument to onInputChange
        // and useState setters log a warning if a second argument is passed
        onInputChange={val => setSearch(val)}
        isLoading={loading}
        autoFocus={autoFocus}
        isMulti={isMulti}
        components={selectComponents}
        getOptionValue={option => option.value.id}
        value={currentValue}
        placeholder={canRead ? undefined : serverError && serverError.message}
        options={options}
        onChange={onChange}
        id={`react-select-${htmlID}`}
        isClearable
        instanceId={htmlID}
        inputId={htmlID}
        innerRef={ref}
        menuPortalTarget={document.body}
        isDisabled={isDisabled}
        {...selectProps}
      />
    );
  }
);

const RelationshipSelect = ({
  innerRef,
  autoFocus,
  field,
  errors: serverErrors,
  renderContext,
  htmlID,
  onChange,
  isMulti,
  value,
  isDisabled,
}) => {
  const [search, setSearch] = useState('');
  const refList = field.getRefList();

  const QUERY = gql`
    query RelationshipSelect($search: String!, $first: Int!, $skip: Int!) {
      ${refList.gqlNames.listQueryName}(search: $search, first: $first, skip: $skip) {
        _label_
        id
      }

      ${refList.gqlNames.listQueryMetaName}(search: $search) {
        count
      }
    }
  `;

  const canRead =
    !serverErrors ||
    serverErrors.every(error => !(error instanceof Error && error.name === 'AccessDeniedError'));
  const selectProps = renderContext === 'dialog' ? { menuShouldBlockScroll: true } : null;

  const { data, error, loading, fetchMore } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: { search, first: initialItemsToLoad, skip: 0 },
  });

  // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)
  if (error) {
    console.log('ERROR!!!', error);
    return 'Error';
  }

  return (
    <Relationship
      {...{
        data,
        loading,
        value,
        refList,
        canRead,
        isMulti,
        search,
        autoFocus,
        serverErrors,
        onChange,
        htmlID,
        setSearch,
        selectProps,
        fetchMore,
        ref: innerRef,
        isDisabled,
      }}
    />
  );
};

export default RelationshipSelect;
