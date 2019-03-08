import React from 'react';
import { flatten } from '@keystone-alpha/utils';
import dynamic from 'next/dynamic';

import PageError from '../components/PageError';
import { viewMeta, loadView } from '../FIELD_TYPES';

const Loading = ({ error }) => {
  if (error) {
    return (
      <PageError>
        {process.env.NODE_ENV === 'production'
          ? 'There was an error loading the page'
          : error.message || error.toString()}
      </PageError>
    );
  }
  // don't render at all while loading
  return null;
};

// Convert from nested list info:
// {
//   User: {
//     name: { Field: '@keystone-alpha/type/foo', Cell: '..', blocks: ['..'] },
//     email: { Field: '@keystone-alpha/type/zip', Cell: '..', blocks: ['..'] },
//   }
// }
// to an array of module types and their module paths
// [
//   { Field: '@keystone-alpha/type/foo', Cell: '..', Filter: '..', blocks: ['..'] },
//   { Field: '@keystone-alpha/type/zip', Cell: '..', Filter: '..', blocks: ['..'] },
// ]
const arrayOfViews = flatten(Object.values(viewMeta).map(fields => Object.values(fields)));

// Convert
// [
//   { Field: '@keystone-alpha/type/foo', Cell: '..', Filter: '..', blocks: ['..'] },
//   { Field: '@keystone-alpha/type/zip', Cell: '..', Filter: '..', blocks: ['..'] },
// ]
// into a form more useful:
// {
//   Field: {
//     '@keystone-alpha/type/foo': <Loadable>,
//     '@keystone-alpha/type/zip': <Loadable>,
//   },
//   blocks: {
//     '@keystone-alpha/type/foo': <Loadable>,
//     '@keystone-alpha/type/zip': <Loadable>,
//   },
//   Cell: { ... },
//   Filter: { ... }
// }
// NOTE: We build up all the loadables _outside_ a component render.
// This is necessary to make SSR work:
// https://github.com/jamiebuilds/react-loadable/tree/v5.5.0#loadablepreloadall
// On the client, only the rendered ones will be executed, meaning it wont
// over-fetch any modules.
export const viewLoadables = arrayOfViews.reduce((memo, field) => {
  Object.keys(field).forEach(fieldKey => {
    memo[fieldKey] = memo[fieldKey] || {};

    let modules = field[fieldKey];

    // Some modules are arrays (eg; the `blocks`), so we default to making them
    // _all_ arrays so the following code is consistent.
    if (!Array.isArray(modules)) {
      modules = [modules];
    }

    modules.forEach(module => {
      memo[fieldKey][module] =
        memo[fieldKey][module] || dynamic(() => loadView(module), { loading: Loading });
    });
  });
  return memo;
}, {});
