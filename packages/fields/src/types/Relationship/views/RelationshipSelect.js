// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Select from '@arch-ui/select';
import { components } from 'react-select';
import 'intersection-observer';
import { useState, useMemo, useRef, useEffect, forwardRef } from 'react';

type Props = {
  innerRef?: React.Ref<*>,
  autoFocus?: boolean,
  field: Object,
  error?: Error,
  renderContext: string | null,
  htmlID: string,
  onChange: Function,
  value: *,
  isMulti: boolean,
};

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

const initalItemsToLoad = 10;
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
      serverError,
      onChange,
      htmlID,
      setSearch,
      selectProps,
      fetchMore,
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

          useIntersectionObserver(([{ isIntersecting }]) => {
            if (!props.isLoading && isIntersecting && props.options.length < count) {
              fetchMore({
                query: gql`query RelationshipSelectMore($search: String!, $skip: Int!) {${refList.buildQuery(
                  refList.gqlNames.listQueryName,
                  `(first: ${subsequentItemsToLoad}, search: $search, skip: $skip)`
                )}}`,
                variables: {
                  search,
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
        placeholder={
          // $FlowFixMe
          canRead ? undefined : serverError.message
        }
        options={options}
        onChange={onChange}
        id={`react-select-${htmlID}`}
        isClearable
        instanceId={htmlID}
        inputId={htmlID}
        innerRef={ref}
        menuPortalTarget={document.body}
        {...selectProps}
      />
    );
  }
);

const RelationshipSelect = ({
  innerRef,
  autoFocus,
  field,
  error: serverError,
  renderContext,
  htmlID,
  onChange,
  isMulti,
  value,
}: Props) => {
  const [search, setSearch] = useState('');
  const refList = field.getRefList();
  const query = gql`query RelationshipSelect($search: String!, $skip: Int!) {${refList.buildQuery(
    refList.gqlNames.listQueryName,
    `(first: ${initalItemsToLoad}, search: $search, skip: $skip)`
  )}${refList.countQuery(`(search: $search)`)}}`;

  const canRead = !(serverError instanceof Error && serverError.name === 'AccessDeniedError');

  const selectProps = renderContext === 'dialog' ? { menuShouldBlockScroll: true } : null;

  return (
    <Query query={query} variables={{ search, skip: 0 }}>
      {({ data, error, loading, fetchMore }) => {
        // TODO: better error UI
        // TODO: Handle permission errors
        // (ie; user has permission to read this relationship field, but
        // not the related list, or some items on the list)
        if (error) console.log('ERROR!!!', error);
        if (error) return 'Error';

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
              serverError,
              onChange,
              htmlID,
              setSearch,
              selectProps,
              fetchMore,
              ref: innerRef,
            }}
          />
        );
      }}
    </Query>
  );
};

export default RelationshipSelect;
