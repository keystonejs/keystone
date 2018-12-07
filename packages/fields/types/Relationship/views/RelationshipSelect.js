// @flow
import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Select } from '@voussoir/ui/src/primitives/filters';
import { pick } from '@voussoir/utils';
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
    // $FlowFixMe flow is wrong, the second argument is optional
    let observer = new IntersectionObserver(cb);
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
  value,
  isMulti,
}: Props) => {
  const [search, setSearch] = useState('');
  const refList = field.getRefList();
  const query = gql`query RelationshipSelect($search: String!, $skip: Int!) {${refList.buildQuery(
    refList.gqlNames.listQueryName,
    `(first: 100, search: $search, skip: $skip)`
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
                  ? data[refList.gqlNames.listQueryName].map(listData => ({
                      value: pick(listData, ['id']),
                      label: listData._label_,
                    }))
                  : [];

              // Collect IDs to represent and convert them into a value.
              let foo;
              if (item && canRead) {
                const fieldValue = item[field.path];
                if (isMulti) {
                  foo = (Array.isArray(fieldValue) ? fieldValue : []).map(i => i.id);
                } else if (fieldValue) {
                  foo = fieldValue.id;
                }
              } else if (value) {
                foo = value;
              }

              let currentValue;
              if (foo) {
                if (isMulti) {
                  currentValue = foo
                    .map(i => options.find(option => option.value.id === i) || null)
                    .filter(i => i);
                } else {
                  currentValue = options.find(option => option.value.id === foo) || null;
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
                            if (!props.isLoading && isIntersecting && children.length < count) {
                              fetchMore({
                                query: gql`query RelationshipSelectMore($search: String!, $skip: Int!) {${refList.buildQuery(
                                  refList.gqlNames.listQueryName,
                                  `(first: 100, search: $search, skip: $skip)`
                                )}}`,
                                variables: {
                                  search,
                                  skip: children.length,
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
                              <div ref={ref} />
                            </components.MenuList>
                          );
                        },
                      };
                    },
                    [count, refList.gqlNames.listQueryName]
                  )}
                  value={currentValue}
                  placeholder={canRead ? undefined : itemErrors[field.path].message}
                  getOptionValue={option => option.value.id}
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
