import React, { Component } from 'react';
import dynamic from 'next/dynamic';
import { mapKeys } from '@keystone-alpha/utils';

import PageError from '../client/components/PageError';
import PageLoading from '../client/components/PageLoading';
import { loadView, customPages } from '../client/FIELD_TYPES';

const Loading = ({ error, pastDelay }) => {
  // avoid flash-of-loading-component
  if (!pastDelay) return null;
  if (error) {
    return (
      <PageError>
        {process.env.NODE_ENV === 'production'
          ? 'There was an error loading the page'
          : error.message || error.toString()}
      </PageError>
    );
  }
  return <PageLoading />;
};

const customPageComponents = mapKeys(customPages, ({ component, ssr = true }) =>
  dynamic(() => loadView(component), { loading: Loading, ssr })
);

export default class CustomPage extends Component {
  static getInitialProps({ query }) {
    return { path: query.path };
  }

  render() {
    const Page = customPageComponents[this.props.path];
    return <Page />;
  }
}
