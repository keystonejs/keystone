// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Select } from '@voussoir/ui/src/primitives/filters';
import { components } from 'react-select';
import 'intersection-observer';
import { useState, useMemo, useRef, useEffect } from '@voussoir/ui/src/new-typed-react';

type Props = {
  innerRef?: React.Ref<*>,
  autoFocus?: boolean,
  field: Object,
  item: Object | null,
  itemErrors: Object,
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

// to use hooks in render props
const Render = props => {
  return props.children();
};

const RelationshipSelect = ({
  innerRef,
  autoFocus,
  field,
  item,
  itemErrors,
  renderContext,
  htmlID,
  onChange,
  isMulti,
}: Props) => {
  const [search, setSearch] = useState('');
  const refList = field.getRefList();
  const query = gql`query RelationshipSelect($search: String!, $skip: Int!) {${refList.buildQuery(
    refList.gqlNames.listQueryName,
    `(first: 10, search: $search, skip: $skip)`
  )}${refList.countQuery(`(search: $search)`)}}`;

  const canRead = !(
    itemErrors[field.path] instanceof Error && itemErrors[field.path].name === 'AccessDeniedError'
  );
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
          <Render>
            {() => {
              const options =
                data && data[refList.gqlNames.listQueryName]
                  ? data[refList.gqlNames.listQueryName].map(val => {
                      return {
                        value: val,
                        label: val._label_,
                      };
                    })
                  : [];

              let currentValue = null;
              if (item && canRead) {
                const fieldValue = item[field.path];
                if (isMulti) {
                  currentValue = (Array.isArray(fieldValue) ? fieldValue : []).map(val => {
                    return {
                      label: val._label_,
                      value: val,
                    };
                  });
                } else if (fieldValue) {
                  currentValue = {
                    label: fieldValue._label_,
                    value: fieldValue,
                  };
                }
              }

              let count =
                data[refList.gqlNames.listQueryMetaName] &&
                data[refList.gqlNames.listQueryMetaName].count;
              return (
                <Select
                  onInputChange={val => {
                    setSearch(val);
                  }}
                  isLoading={loading}
                  autoFocus={autoFocus}
                  isMulti={isMulti}
                  components={useMemo(
                    () => {
                      return {
                        MenuList: ({ children, ...props }) => {
                          const ref = useRef(null);

                          useIntersectionObserver(([{ isIntersecting }]) => {
                            if (
                              !props.isLoading &&
                              isIntersecting &&
                              props.options.length < count
                            ) {
                              fetchMore({
                                query: gql`query RelationshipSelectMore($search: String!, $skip: Int!) {${refList.buildQuery(
                                  refList.gqlNames.listQueryName,
                                  `(first: 50, search: $search, skip: $skip)`
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
                          }, ref);

                          return (
                            <components.MenuList {...props}>
                              {children}
                              <div css={{ textAlign: 'center' }} ref={ref}>
                                {props.options.length < count && (
                                  <span
                                    css={{
                                      padding: 8,
                                    }}
                                  >
                                    Loading...
                                  </span>
                                )}
                              </div>
                            </components.MenuList>
                          );
                        },
                      };
                    },
                    [count, refList.gqlNames.listQueryName]
                  )}
                  getOptionValue={option => option.value.id}
                  value={currentValue}
                  placeholder={canRead ? undefined : itemErrors[field.path].message}
                  options={options}
                  onChange={onChange}
                  id={`react-select-${htmlID}`}
                  isClearable
                  isLoading={loading}
                  instanceId={htmlID}
                  inputId={htmlID}
                  innerRef={innerRef}
                  menuPortalTarget={document.body}
                  {...selectProps}
                />
              );
            }}
          </Render>
        );
      }}
    </Query>
  );
};

export default RelationshipSelect;
