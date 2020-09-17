import { invalidateFields, ROOT } from '@jesstelford/apollo-cache-invalidation';
import { Query, Mutation } from '@apollo/client/react/components';
import hoistStatics from 'hoist-non-react-statics';
import mapValues from 'lodash.mapvalues';
import React from 'react';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';
import memoizeOne from 'memoize-one';

const flatten = arr => Array.prototype.concat(...arr);

const SchemaContext = React.createContext({});

const typeToRegex = type => new RegExp(`^${type}:`);

const queriesToPath = queries => queries.map(query => [ROOT, new RegExp(`^${query}`)]);

// Turns this
// [{ type: "Event", relatedFields: ["rsvps", "_rsvpsMeta"] }]
// Into this
// [[/^Event:/, /^rsvps/], [/^Event:/, /^_rsvpsMeta/]]
const relatedFieldsToPath = relatedFields =>
  flatten(
    relatedFields.map(relatedField =>
      (relatedField.fields || []).map(relatedPath => [
        typeToRegex(relatedField.type),
        new RegExp(`^${relatedPath}`),
      ])
    )
  );

// Gives us something like:
// {
//   RSVP: [[/^RSVP:/], [ROOT, /^_allRSVPsMeta/], [ROOT, /^allRSVPs/], [/^Event:/, /^_rsvpsMeta/]]
// }
const generateInvalidateionPaths = memoizeOne(keystoneTypes =>
  keystoneTypes.reduce((memo, { schema: { type, queries = [], relatedFields = [] } }) => {
    memo[type] = [
      [typeToRegex(type)],
      ...queriesToPath(queries),
      ...relatedFieldsToPath(relatedFields),
    ];
    return memo;
  }, {})
);

// An Apollo post-mutation update function for invalidating entire types from
// the Apollo cache
const updater = (keystoneSchemaInfo, types) => {
  const cacheInvalidationFieldPaths = generateInvalidateionPaths(keystoneSchemaInfo);
  const paths = flatten(
    (Array.isArray(types) ? types : [types]).map(type => cacheInvalidationFieldPaths[type])
  );
  return invalidateFields(() => paths);
};

class KeystoneApolloQueryCacheBuster extends React.Component {
  state = {
    data: null,
    dataSeen: false,
    refetching: false,
    loading: false,
    // 7? See https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-networkStatus
    networkStatus: 7,
  };

  // When the cache is cleared within Apollo, it triggers a re-render of all the
  // watching `<Query>` components. However, it doesn't trigger a refetch of the
  // data, instead blindly trusting the cache data (which is now `undefined`).
  // So we have to do 3 things:
  // 1. Catch that case and manually trigger a refetch. Doing so then causes
  //    another re-render with an invalid loading state, so;
  // 2. we have to manually fix the `loading` and `networkState` values.
  // 3. Finally, during this refetch stage, we need to keep track of the
  //    previous set of data that was returned (so we don't return `undefined`,
  //    which normally never happens in Apollo).
  // The upside is when the cache is cleared, all existing components are
  // correctly re-rendered with expected loading states and data is correctly
  // refetched as expected.
  // The downside is there are a couple of extra re-renders triggered.
  static getDerivedStateFromProps(props, state) {
    const newState = {};

    // These variables are derived from the props
    let loading = props.loading;
    let networkStatus = props.networkStatus;

    // These variables are persisted across re-renders and updated based on
    // props in this function
    let refetching = state.refetching;

    const cacheWasCleared =
      // It's only possible to clear the cache after data has successfully
      // loaded at least once
      state.dataSeen &&
      // data === null is a valid value and doesn't indicate cache
      // clearing
      props.data !== null &&
      // When cache is cleared, we get back either an empty object or undefined
      // depending on if it's an item that was cleared or a field on an item.
      // TODO: Pull the query names out of the `query` prop because a
      // query might have multiple, but only one was invalidated in the
      // cache
      (!props.data || !Object.keys(props.data).length);

    // There's some legitimate data, so we're not refetching anymore
    if (refetching && !loading && !cacheWasCleared) {
      refetching = false;
      newState.refetching = refetching;
    }

    // When the cache is cleared, a re-render is triggered, but it
    // incorrectly re-renders the component as 'loading: true'.
    // The canonical Apollo <Query> component re-renders the component as
    // { loading: false, networkStatus: 4 }, so we emulate that here.
    if (refetching) {
      loading = true;
      networkStatus = 4;
    }

    if (!loading) {
      if (cacheWasCleared) {
        // We've received some data, but it's the result of the cache
        // being cleared, so we need to refetch
        refetching = true;
        newState.refetching = refetching;
        loading = true;
        networkStatus = 4;
        // TODO: Move to componentDidUpdate()?
        props.refetch();
      } else {
        // We've received some data that is ready to be rendered
        newState.dataSeen = true;
        newState.data = props.data;
      }
    }

    newState.loading = loading;
    newState.networkStatus = networkStatus;
    return newState;
  }

  render() {
    const { children, ...props } = this.props;
    return children({
      ...props,
      data: this.state.data,
      loading: this.state.loading,
      networkStatus: this.state.networkStatus,
    });
  }
}

// A drop-in replacement for Apollo's `<Query>` component which works with the
// below KeystoneMutation component for clearing caches
const KeystoneQuery = ({ children, ...props }) => (
  <Query {...props}>
    {renderProps => <KeystoneApolloQueryCacheBuster {...renderProps} children={children} />}
  </Query>
);

const wrapUpdateFunc = (keystoneSchemaInfo, invalidateTypes, update) => (proxy, data) => {
  if (invalidateTypes) {
    updater(keystoneSchemaInfo, invalidateTypes)(proxy, data);
  }
  return update(proxy, data);
};

// A mostly-drop-in replacement for Apollo's `<Mutation>` component with three
// changes:
// 1. An extra prop:
//   - invalidateTypes<String|Array<String>>: GraphQL types to invalidate upon
//     completion of this mutation. Setting this prop will guarantee all data
//     stored for that type in the Apollo cache is cleared. This is a middle
//     ground between every mutation manually updating cache values, and the
//     brute-force approach of clearing the entire Apollo cache.
//
// 2. Coallescing the render prop arguments to a single variable. ie, instead of
//
//    {(mutate, { data, loading, error, called, client }) => (
//      <button onClick={mutate}>Do it</button>
//    )}
//
//    It is now:
//
//    {(mutate) => {
//      const { data, loading, error, called, client } = mutate;
//      return <button onClick={mutate}>Do it</button>;
//    }}
//
// 3. Must be used within a tree wrapped in <KeystoneProvider> or withKeystone()
class KeystoneMutation extends React.Component {
  render() {
    const { invalidateTypes, children, update: updateProp = () => {}, ...props } = this.props;

    return (
      <SchemaContext.Consumer>
        {keystoneSchemaInfo => {
          const interceptedUpdateProp = wrapUpdateFunc(
            keystoneSchemaInfo,
            invalidateTypes,
            updateProp
          );

          return (
            <Mutation {...props} update={interceptedUpdateProp}>
              {(mutation, info) => {
                const interceptedMutation = ({
                  // Support the same order of precedence that Apollo does (mutate({ update }) overwrites <Mutation update={}>)
                  update: updateOption = updateProp,
                  optimisticResponse,
                  ...rest
                }) => {
                  let interceptedUpdateOption;

                  if (optimisticResponse) {
                    let optimisticHandled = false;

                    interceptedUpdateOption = (...args) => {
                      // We only want to clear the cache after the actual network call
                      // has returned, not when we've set the optimistic response,
                      // otherwise we can trigger a race condition where the refetch()
                      // might return quicker than the mutation, resulting in stale
                      // data. We might also trigger refetch() twice, which we want to
                      // avoid.
                      if (optimisticHandled) {
                        return wrapUpdateFunc(
                          keystoneSchemaInfo,
                          invalidateTypes,
                          updateOption
                        )(...args);
                      } else {
                        optimisticHandled = true;
                        return updateOption(...args);
                      }
                    };
                  } else {
                    // No optimistic response set? Always clear the cache when update is
                    // called.
                    interceptedUpdateOption = wrapUpdateFunc(
                      keystoneSchemaInfo,
                      invalidateTypes,
                      updateOption
                    );
                  }

                  return mutation({ update: interceptedUpdateOption, optimisticResponse, ...rest });
                };

                // Make sure all the mutation options are available on the mutation
                // function for consistency with the <Query> component
                // (ie; only single parameter required)
                const mergedMutation = Object.entries(info || {}).reduce((memo, [key, value]) => {
                  if (memo[key]) {
                    return memo;
                  }
                  memo[key] = value;
                  return memo;
                }, interceptedMutation);

                return children(mergedMutation, info);
              }}
            </Mutation>
          );
        }}
      </SchemaContext.Consumer>
    );
  }
}

const META_QUERY = gql`
  query ListMeta {
    _ksListsMeta {
      schema {
        type
        queries
        relatedFields {
          type
          fields
        }
      }
    }
  }
`;

// These values are used in memoization functions, so we want to ensure it's
// always the same by defining it once here
// (ie; we don't create a new empty object on each call)
const emptyObject = Object.freeze(Object.create(null));
const emptyArray = [];

// Will contain the result of the META_QUERY above (see note in KeystoneProvider
// for more info on when/why)
let keystoneListsMeta = [];

class KeystoneProvider extends React.Component {
  render() {
    return (
      <KeystoneQuery query={META_QUERY}>
        {({ data, loading }) => {
          // NOTE: We're setting a global variable here, which then impacts the
          // functionality of local resolvers.
          // This is hacky, but there is no other way to get the data into the
          // right place at the right time given the chicken and egg situation
          // we have:
          // Chicken: Setting up Apollo with the 'link-state' adapter to set the
          //   _isOptimistic flag.
          // Egg: We need to know the types to set the flag on, but that comes
          //   via a GraphQL query from Apollo).
          keystoneListsMeta = loading || !data ? emptyArray : data._ksListsMeta || emptyArray;
          return (
            <SchemaContext.Provider value={keystoneListsMeta}>
              {this.props.children}
            </SchemaContext.Provider>
          );
        }}
      </KeystoneQuery>
    );
  }
}

// A HOC version of <KeystoneProvider>
const withKeystone = Component => {
  const WrappingComponent = props => (
    <KeystoneProvider>
      <Component {...props} />
    </KeystoneProvider>
  );

  WrappingComponent.displayName = `WithKeystone(${Component.displayName || Component.name})`;
  hoistStatics(WrappingComponent, Component);

  return WrappingComponent;
};

// To keep track of optimistic responses correctly, we inject an `_isOptimistic`
// flag for every item in the Apollo cache.
// To do so, we wrap the `resolvers` option of an Apollo-Link-State instance.
function injectIsOptimisticFlag({
  resolvers = emptyObject,
  defaults = emptyObject,
  ...rest
} = emptyObject) {
  const injectIsOptimisticFlagToKeystoneTypes = memoizeOne((inputResolvers, keystoneTypes) =>
    (keystoneTypes || []).reduce(
      (memo, { schema: { type } }) => ({
        ...memo,
        [type]: {
          ...memo[type],
          // Inject the _isOptimistic field resolver here.
          // We do this to ensure that every type can access a boolean value.
          _isOptimistic: (rootValue, args, { optimisticResponse }) => {
            // We only care if it is or isn't an optimistic response, not what the
            // actual response is or not.
            // The existence of this key indicates it is an optimistic response.
            return !!optimisticResponse;
          },
        },
      }),
      inputResolvers
    )
  );

  return {
    // Return a function which performs a memoized lookup based on the current
    // known state of resolvers / list info
    resolvers: () => injectIsOptimisticFlagToKeystoneTypes(resolvers, keystoneListsMeta),
    defaults: {
      ...defaults,
      _isOptimistic: false,
    },
    ...rest,
  };
}

// Flatten your nested <Query>/<Mutation>s to make your code easier to read and
// reason about.
// Go from this:
/*
const GET_FOO_QUERY = gql`...`
const UPDATE_FOO_MUTATION = gql`...`
const ADD_FOO_MUTATION = gql`...`

const App = () => (
  <Query query={GET_FOO_QUERY}>
    {({ data }) => (
      <Mutation query={UPDATE_FOO_MUTATION}>
        {updateFoo => (
          <Mutation query={ADD_FOO_MUTATION}>
            {addFoo => (
              <div>
                Foo: <pre>{JSON.stringify(data, null, 2)}</pre>
                <button onClick={updateFoo}>Update</button>
                <button onClick={addFoo}>Add</button>
              </div>
            )}
          </Mutation>
        )}
      </Mutation>
    )}
  </Query>
)
*/
//
// To this:
//
/*
const GET_FOO_QUERY = gql`...`
const UPDATE_FOO_MUTATION = gql`...`
const ADD_FOO_MUTATION = gql`...`

// NOTE: This format only works with the `Query`/`Mutation` components from this
// module, not Apollo's `Query`/`Mutation` queries. For those, you'll have to
// wrap each item in a function ({ render }) => <Query ..>{render}</Query>
const GraphQL = flattenApollo({
  foo: <Query query={GET_FOO_QUERY}>,
  updateFoo: <Mutation query={UPDATE_FOO_MUTATION}>,
  addFoo: <Mutation query={ADD_FOO_MUTATION}>,
})

const App = () => (
  <GraphQL>
    {({ foo, updateFoo, addFoo }) => (
      <div>
        Foo: <pre>{JSON.stringify(foo, null, 2)}</pre>
        <button onClick={updateFoo}>Update</button>
        <button onClick={addFoo}>Add</button>
      </div>
    )}
  </GraphQL>
);
*/
const flattenApollo = options =>
  adopt(
    mapValues(options, adoption => {
      if (typeof adoption === 'function') {
        return adoption;
      }
      return ({ render, ...props }) => React.cloneElement(adoption, props, render);
    })
  );

export {
  KeystoneMutation as Mutation,
  KeystoneQuery as Query,
  KeystoneProvider,
  withKeystone,
  injectIsOptimisticFlag,
  flattenApollo,
};
