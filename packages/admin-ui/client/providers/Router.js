import NextLink from 'next/link';
import hoistStatics from 'hoist-non-react-statics';
import { prefixURL } from 'next-prefixed';
import React, { Component } from 'react';
import NextRouter, { withRouter as nextWithRouter } from 'next/router';

import router from '../router';

export const routes = router(process.env.assetPrefix);

export const Link = ({ route, params, ...props }) => (
  <NextLink {...props} {...route && routes[route].to(params)} />
);

/**
 * Passes through to next/router, with two modifications:
 * - `.push()` now has the signature `push({ route, params }, opts)`
 * - `.replace()` now has the signature `replace({ route, params }, opts)`
 * and 1 addition:
 * - `.as({ route, params })` returns the pretty URL for a given route
 */
const createRouterProxy = nextRouter => {
  return new Proxy(
    {},
    {
      get(_, method) {
        switch (method) {
          case 'push':
          case 'replace': {
            return ({ route, params }, opts) => {
              const { href, as } = routes[route].to(params);
              return nextRouter[method](href, as, opts);
            };
          }

          case 'as': {
            return ({ route, params }) => {
              return routes[route].to(params).as;
            };
          }

          default: {
            // Pass-through for everything else
            return Reflect.get(nextRouter, method);
          }
        }
      },
    }
  );
};

export const Router = createRouterProxy(NextRouter);

export const withRouter = ComposedComponent => {
  const WithRouteWrapper = nextWithRouter(
    class extends Component {
      state = {};

      static getDerivedStateFromProps({ router: nextRouter }) {
        return {
          router: createRouterProxy(nextRouter),
        };
      }

      render() {
        return <ComposedComponent {...this.props} router={this.state.router} />;
      }
    }
  );

  return hoistStatics(WithRouteWrapper, ComposedComponent);
};

export { prefixURL };
